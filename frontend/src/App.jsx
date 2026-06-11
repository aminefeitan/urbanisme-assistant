import React, { useState, useRef, useEffect, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import MessageBubble from "./components/MessageBubble";
import InputBar from "./components/InputBar";
import Sidebar from "./components/Sidebar";
import { sendMessage, clearHistory } from "./services/api";
import LandingPage from "./components/LandingPage";

const WELCOME = {
  role: "assistant",
  content: `مرحباً! أنا مساعدك القانوني لشؤون التعمير بالمغرب 🏛️

أنا متخصص في **القانون 12-90** المتعلق بالتعمير بالمغرب.

**كيفاش نقدر نعاونك؟**
- تحليل شكايتك ديال التعمير
- شرح المقتضيات القانونية
- اقتراح المسار الإداري الصحيح

اكتب شكايتك أو سؤالك بالدارجة أو الفرنسية 👇`,
};

const STORAGE_KEY = "urbanisme_conversations";

function loadConversations() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function saveConversations(convos) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(convos));
}

/** Extract a short title from the first user message */
function extractTitle(messages) {
  const first = messages.find((m) => m.role === "user");
  if (!first) return "Nouvelle conversation";
  const text = first.content.replace(/\s+/g, " ").trim();
  return text.length > 50 ? text.slice(0, 50) + "…" : text;
}

export default function App() {
  const [hasStarted, setHasStarted] = useState(false);
  const [sessionId, setSessionId] = useState(uuidv4());
  const [messages, setMessages] = useState([WELCOME]);
  const [loading, setLoading] = useState(false);
  const abortControllerRef = useRef(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => window.innerWidth <= 900);
  const [conversations, setConversations] = useState(loadConversations);
  const [isLightMode, setIsLightMode] = useState(() => localStorage.getItem("theme") === "light");
  const bottomRef = useRef(null);

  useEffect(() => {
    localStorage.setItem("theme", isLightMode ? "light" : "dark");
    if (isLightMode) {
      document.body.setAttribute("data-theme", "light");
    } else {
      document.body.removeAttribute("data-theme");
    }
  }, [isLightMode]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  /** Persist current conversation whenever messages change (skip welcome-only) */
  const persistCurrent = useCallback(
    (msgs) => {
      // Only save if there's at least one user message
      if (!msgs.some((m) => m.role === "user")) return;

      setConversations((prev) => {
        const idx = prev.findIndex((c) => c.id === sessionId);
        const existing = idx >= 0 ? prev[idx] : null;
        const entry = {
          id: sessionId,
          title: extractTitle(msgs),
          updatedAt: Date.now(),
          messages: msgs,
          pinned: existing?.pinned || false,
        };
        let updated;
        if (idx >= 0) {
          updated = [...prev];
          updated[idx] = entry;
        } else {
          updated = [entry, ...prev];
        }
        // Keep latest 30 conversations
        updated = updated.slice(0, 30);
        saveConversations(updated);
        return updated;
      });
    },
    [sessionId]
  );

  const handleSend = async (text, baseHistory = messages) => {
    const userMsg = { role: "user", content: text };
    const withUser = [...baseHistory, userMsg];
    setMessages(withUser);
    persistCurrent(withUser);
    setLoading(true);
    abortControllerRef.current = new AbortController();

    try {
      const data = await sendMessage(text, sessionId, abortControllerRef.current.signal);
      const withBot = [...withUser, { role: "assistant", content: data.response }];
      setMessages(withBot);
      persistCurrent(withBot);
    } catch (err) {
      if (err.name === "AbortError") {
        // Request was aborted by user, we keep the user message
        return;
      }
      const withErr = [
        ...withUser,
        { role: "assistant", content: `❌ خطأ: ${err.message}` },
      ];
      setMessages(withErr);
      persistCurrent(withErr);
    } finally {
      setLoading(false);
      abortControllerRef.current = null;
    }
  };

  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  const handleEditMessage = (index, newText) => {
    const truncated = messages.slice(0, index);
    setMessages(truncated);
    persistCurrent(truncated);
    handleSend(newText, truncated);
  };

  const handleDeleteMessage = (index) => {
    // Delete the user message and the immediate assistant response following it (if it exists)
    const updated = messages.filter((msg, i) => {
      if (i === index) return false; // delete user message
      if (i === index + 1 && msg.role === "assistant") return false; // delete bot answer
      return true;
    });
    setMessages(updated);
    persistCurrent(updated);
  };

  const handleNewChat = async () => {
    await clearHistory(sessionId).catch(() => { });
    setSessionId(uuidv4());
    setMessages([WELCOME]);
  };

  const handleSelectConversation = (convo) => {
    setSessionId(convo.id);
    setMessages(convo.messages);
  };

  const handleDeleteConversation = (id) => {
    setConversations((prev) => {
      const updated = prev.filter((c) => c.id !== id);
      saveConversations(updated);
      return updated;
    });
    // If deleting the active conversation, start a new one
    if (id === sessionId) {
      setSessionId(uuidv4());
      setMessages([WELCOME]);
    }
  };

  const handlePinConversation = (id) => {
    setConversations((prev) => {
      const updated = prev.map((c) =>
        c.id === id ? { ...c, pinned: !c.pinned } : c
      );
      saveConversations(updated);
      return updated;
    });
  };

  if (!hasStarted) {
    return <LandingPage onStart={() => setHasStarted(true)} />;
  }

  return (
    <div className="app-layout">
      <Sidebar
        onNewChat={handleNewChat}
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((v) => !v)}
        conversations={conversations}
        activeSessionId={sessionId}
        onSelectConversation={handleSelectConversation}
        onDeleteConversation={handleDeleteConversation}
        onPinConversation={handlePinConversation}
      />

      {/* Overlay for mobile */}
      <div
        className={`sidebar-overlay ${sidebarCollapsed ? 'hidden' : ''}`}
        onClick={() => setSidebarCollapsed(true)}
      />

      {/* Main chat */}
      <main className="chat-main">
        <div className="chat-header">
          <button
            className="mobile-menu-btn"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            title="Menu"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>
          <h1>Assistant Urbanisme <span className="law-badge">Loi 12-90</span></h1>
          <button
            className="theme-toggle-btn"
            onClick={() => setIsLightMode(!isLightMode)}
            title="Basculer le thème"
          >
            {isLightMode ? '🌙' : '☀️'}
          </button>
        </div>

        <div className="messages-area">
          {messages.map((msg, i) => (
            <MessageBubble
              key={i}
              role={msg.role}
              content={msg.content}
              onEdit={(newText) => handleEditMessage(i, newText)}
              onDelete={() => handleDeleteMessage(i)}
            />
          ))}
          {loading && (
            <div className="bubble-wrap bubble-bot">
              <div className="bot-avatar"><span>⚖️</span></div>
              <div className="bubble bubble-bot-inner typing-indicator">
                <span /><span /><span />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <InputBar onSend={handleSend} isLoading={loading} onStop={handleStop} />
      </main>
    </div>
  );
}


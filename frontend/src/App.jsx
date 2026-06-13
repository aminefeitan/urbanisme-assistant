import React, { useState, useRef, useEffect, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import MessageBubble from "./components/MessageBubble";
import InputBar from "./components/InputBar";
import Sidebar from "./components/Sidebar";
import {
  sendMessage,
  clearHistory,
  getMe,
  getConversations,
  deleteConversation as apiDeleteConversation,
  pinConversation as apiPinConversation,
  getConversationMessages,
} from "./services/api";
import LandingPage from "./components/LandingPage";
import AuthPage from "./components/AuthPage";

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

/** Extract a short title from the first user message */
function extractTitle(messages) {
  const first = messages.find((m) => m.role === "user");
  if (!first) return "Nouvelle conversation";
  const text = first.content.replace(/\s+/g, " ").trim();
  return text.length > 50 ? text.slice(0, 50) + "…" : text;
}

export default function App() {
  // appState: 'landing' | 'login' | 'register' | 'guest' | 'chat'
  const [appState, setAppState] = useState("landing");
  const [user, setUser] = useState(null);
  const [sessionId, setSessionId] = useState(uuidv4());
  const [messages, setMessages] = useState([WELCOME]);
  const [loading, setLoading] = useState(false);
  const abortControllerRef = useRef(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    () => window.innerWidth <= 900
  );
  const [conversations, setConversations] = useState([]);
  const [isLightMode, setIsLightMode] = useState(
    () => localStorage.getItem("theme") === "light"
  );
  const bottomRef = useRef(null);

  const isGuest = appState === "guest";
  const isAuthenticated = appState === "chat" && user !== null;

  // --- Theme ---
  useEffect(() => {
    localStorage.setItem("theme", isLightMode ? "light" : "dark");
    if (isLightMode) {
      document.body.setAttribute("data-theme", "light");
    } else {
      document.body.removeAttribute("data-theme");
    }
  }, [isLightMode]);

  // --- Auto-login from token ---
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      getMe()
        .then((data) => {
          setUser(data.user);
          setAppState("chat");
        })
        .catch(() => {
          localStorage.removeItem("authToken");
        });
    }
  }, []);

  // --- Load conversations from DB when authenticated ---
  const loadConversationsFromDB = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const convos = await getConversations();
      setConversations(convos);
    } catch (err) {
      console.error("Failed to load conversations:", err);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    loadConversationsFromDB();
  }, [loadConversationsFromDB]);

  // --- Auto-scroll ---
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // --- Send message ---
  const handleSend = async (text, baseHistory = messages) => {
    const userMsg = { role: "user", content: text };
    const withUser = [...baseHistory, userMsg];
    setMessages(withUser);
    setLoading(true);
    abortControllerRef.current = new AbortController();

    try {
      const data = await sendMessage(
        text,
        sessionId,
        abortControllerRef.current.signal
      );
      const withBot = [
        ...withUser,
        { role: "assistant", content: data.response },
      ];
      setMessages(withBot);

      // Refresh conversations list from DB for authenticated users
      if (isAuthenticated) {
        loadConversationsFromDB();
      }
    } catch (err) {
      if (err.name === "AbortError") return;
      const withErr = [
        ...withUser,
        { role: "assistant", content: `❌ خطأ: ${err.message}` },
      ];
      setMessages(withErr);
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
    handleSend(newText, truncated);
  };

  const handleDeleteMessage = (index) => {
    const updated = messages.filter((msg, i) => {
      if (i === index) return false;
      if (i === index + 1 && msg.role === "assistant") return false;
      return true;
    });
    setMessages(updated);
  };

  const handleNewChat = async () => {
    await clearHistory(sessionId).catch(() => { });
    setSessionId(uuidv4());
    setMessages([WELCOME]);
  };

  const handleSelectConversation = async (convo) => {
    setSessionId(convo.id);
    // Load messages from DB
    try {
      const data = await getConversationMessages(convo.id);
      if (data.messages && data.messages.length > 0) {
        setMessages(data.messages);
      } else {
        setMessages([WELCOME]);
      }
    } catch {
      setMessages([WELCOME]);
    }
  };

  const handleDeleteConversation = async (id) => {
    try {
      await apiDeleteConversation(id);
      setConversations((prev) => prev.filter((c) => c.id !== id));
      if (id === sessionId) {
        setSessionId(uuidv4());
        setMessages([WELCOME]);
      }
    } catch (err) {
      console.error("Failed to delete conversation:", err);
    }
  };

  const handlePinConversation = async (id) => {
    try {
      const result = await apiPinConversation(id);
      setConversations((prev) =>
        prev.map((c) => (c.id === id ? { ...c, pinned: result.pinned } : c))
      );
    } catch (err) {
      console.error("Failed to pin conversation:", err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    setUser(null);
    setConversations([]);
    setAppState("landing");
    setMessages([WELCOME]);
    setSessionId(uuidv4());
  };

  // --- Routing ---

  if (appState === "landing") {
    return (
      <LandingPage
        onLogin={() => setAppState("login")}
        onRegister={() => setAppState("register")}
        onGuest={() => {
          setSessionId(uuidv4());
          setMessages([WELCOME]);
          setAppState("guest");
        }}
      />
    );
  }

  if (appState === "login" || appState === "register") {
    return (
      <AuthPage
        initialMode={appState}
        onLoginSuccess={(userData) => {
          setUser(userData);
          setAppState("chat");
        }}
        onBack={() => setAppState("landing")}
      />
    );
  }

  // --- Chat view (guest or authenticated) ---
  return (
    <div className="app-layout">
      {/* Sidebar only for authenticated users */}
      {isAuthenticated && (
        <Sidebar
          onNewChat={handleNewChat}
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed((v) => !v)}
          conversations={conversations}
          activeSessionId={sessionId}
          onSelectConversation={handleSelectConversation}
          onDeleteConversation={handleDeleteConversation}
          onPinConversation={handlePinConversation}
          user={user}
          onLogout={handleLogout}
        />
      )}

      {/* Overlay for mobile */}
      {isAuthenticated && (
        <div
          className={`sidebar-overlay ${sidebarCollapsed ? "hidden" : ""}`}
          onClick={() => setSidebarCollapsed(true)}
        />
      )}

      {/* Main chat */}
      <main className="chat-main">
        <div className="chat-header">
          {isAuthenticated && (
            <button
              className="mobile-menu-btn"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              title="Menu"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            </button>
          )}
          <h1>Assistant Urbanisme</h1>
          <button
            className="theme-toggle-btn"
            onClick={() => setIsLightMode(!isLightMode)}
            title="Basculer le thème"
          >
            {isLightMode ? "🌙" : "☀️"}
          </button>

          {isGuest && (
            <button
              className="theme-toggle-btn"
              onClick={() => setAppState("login")}
              title="Se connecter"
              style={{ marginLeft: "0.5rem" }}
            >
              🔑
            </button>
          )}
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
              <div className="bot-avatar">
                <span>⚖️</span>
              </div>
              <div className="bubble bubble-bot-inner typing-indicator">
                <span />
                <span />
                <span />
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

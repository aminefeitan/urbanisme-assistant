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
import translations from "./translations";
import SettingsPage from "./components/SettingsPage";
import AdminDashboard from "./components/AdminDashboard";

function getWelcome(lang) {
  return {
    role: "assistant",
    content: translations[lang]?.welcome || translations.ar.welcome,
  };
}

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
  const [showSettings, setShowSettings] = useState(false);
  const [user, setUser] = useState(null);
  const [sessionId, setSessionId] = useState(uuidv4());
  const [language, setLanguage] = useState(
    () => localStorage.getItem("appLanguage") || "ar"
  );
  const [messages, setMessages] = useState([getWelcome(language)]);
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
  const t = translations[language] || translations.ar;
  const isRTL = language === "ar";

  // --- Language ---
  useEffect(() => {
    localStorage.setItem("appLanguage", language);
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = language === "ar" ? "ar" : "fr";
  }, [language]);

  const handleLanguageChange = (newLang) => {
    setLanguage(newLang);
    // Update welcome message if it's the only message (fresh chat)
    setMessages((prev) => {
      if (prev.length === 1 && prev[0].role === "assistant") {
        return [getWelcome(newLang)];
      }
      return prev;
    });
  };

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
        abortControllerRef.current.signal,
        language
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
        { role: "assistant", content: `❌ ${language === "ar" ? "خطأ" : "Erreur"}: ${err.message}` },
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
    setSessionId(uuidv4());
    setMessages([getWelcome(language)]);
  };

  const handleSelectConversation = async (convo) => {
    setSessionId(convo.id);
    // Load messages from DB
    try {
      const data = await getConversationMessages(convo.id);
      if (data.messages && data.messages.length > 0) {
        setMessages(data.messages);
      } else {
        setMessages([getWelcome(language)]);
      }
    } catch {
      setMessages([getWelcome(language)]);
    }
  };

  const handleDeleteConversation = async (id) => {
    try {
      await apiDeleteConversation(id);
      setConversations((prev) => prev.filter((c) => c.id !== id));
      if (id === sessionId) {
        setSessionId(uuidv4());
        setMessages([getWelcome(language)]);
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
    setMessages([getWelcome(language)]);
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
          setMessages([getWelcome(language)]);
          setAppState("guest");
        }}
        language={language}
        onLanguageChange={handleLanguageChange}
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
        language={language}
        onLanguageChange={handleLanguageChange}
      />
    );
  }

  // --- Admin view ---
  if (appState === "chat" && user?.is_admin) {
    return (
      <AdminDashboard
        user={user}
        onLogout={handleLogout}
        isLightMode={isLightMode}
        onToggleTheme={() => setIsLightMode(!isLightMode)}
      />
    );
  }

  // --- Chat view (guest or authenticated) ---
  return (
    <div className="flex h-screen w-full overflow-hidden bg-appBg text-appText font-sans app-layout" dir={isRTL ? "rtl" : "ltr"}>
      {/* Sidebar only for authenticated users */}
      {isAuthenticated && (
        <Sidebar
          onNewChat={() => { setShowSettings(false); handleNewChat(); }}
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed((v) => !v)}
          conversations={conversations}
          activeSessionId={sessionId}
          onSelectConversation={(convo) => { setShowSettings(false); handleSelectConversation(convo); }}
          onDeleteConversation={handleDeleteConversation}
          onPinConversation={handlePinConversation}
          user={user}
          onUpdateUser={(userData) => setUser(userData)}
          onLogout={handleLogout}
          isLightMode={isLightMode}
          onToggleTheme={() => setIsLightMode(!isLightMode)}
          language={language}
          onLanguageChange={handleLanguageChange}
          onOpenSettings={() => setShowSettings(true)}
        />
      )}

      {/* Overlay for mobile */}
      {isAuthenticated && (
        <div
          className={`fixed inset-0 bg-black/50 z-30 transition-opacity duration-300 md:hidden ${sidebarCollapsed ? "opacity-0 pointer-events-none" : "opacity-100 pointer-events-auto"}`}
          onClick={() => setSidebarCollapsed(true)}
        />
      )}

      {/* Main content: Settings or Chat */}
      {showSettings ? (
        <SettingsPage
          isLightMode={isLightMode}
          onToggleTheme={() => setIsLightMode(!isLightMode)}
          language={language}
          onLanguageChange={handleLanguageChange}
          onBack={() => setShowSettings(false)}
        />
      ) : (
        <main className="flex-1 flex flex-col min-w-0 h-full bg-surface relative z-0 chat-main">
          <div className="h-[72px] shrink-0 px-4 sm:px-6 flex items-center border-b border-appBorder bg-surface/80 backdrop-blur-md sticky top-0 z-10 chat-header">
            {isAuthenticated && (
              <button
                className={`${isRTL ? "ml-3 -mr-2" : "mr-3 -ml-2"} p-2 rounded-lg border-none bg-transparent text-muted hover:bg-surface2 cursor-pointer md:hidden transition-colors`}
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                title={t.menu}
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
            <h1 className="text-[1.1rem] sm:text-[1.15rem] font-bold text-appText m-0 logo-title">{t.headerTitle}</h1>
            {isGuest && (
              <button
                className={`${isRTL ? "mr-auto" : "ml-auto"} w-10 h-10 rounded-xl bg-surface2 border border-appBorder text-muted flex items-center justify-center cursor-pointer transition-all duration-200 hover:text-accent2 focus:outline-none focus:ring-2 focus:ring-accent2`}
                onClick={() => setAppState("login")}
                title={t.loginButton}
              >
                🔑
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 flex flex-col gap-6 scrollbar-thin scrollbar-thumb-muted">
            {messages.map((msg, i) => (
              <MessageBubble
                key={i}
                role={msg.role}
                content={msg.content}
                onEdit={(newText) => handleEditMessage(i, newText)}
                onDelete={() => handleDeleteMessage(i)}
                language={language}
              />
            ))}
            {loading && (
              <div className={`flex items-start gap-2.5 max-w-[780px] ${isRTL ? "ml-auto" : "mr-auto"} animate-fadeUp`}>
                <div className="w-[34px] h-[34px] rounded-full flex items-center justify-center text-base shrink-0 mt-0.5 border-none bg-transparent overflow-hidden">
                  <img
                    src="/logo_chatbot.png"
                    alt="Bot"
                    className="w-full h-full object-contain scale-[1.81]"
                  />
                </div>
                <div className={`relative p-3.5 sm:p-4 ${isRTL ? "rounded-[16px] rounded-tr-sm" : "rounded-[16px] rounded-tl-sm"} bg-surface border border-appBorder shadow-sm flex items-center gap-1.5 min-h-[44px] typing-indicator`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-muted animate-[bounce_1.2s_infinite_ease-in-out]"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-muted animate-[bounce_1.2s_infinite_ease-in-out_0.2s]"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-muted animate-[bounce_1.2s_infinite_ease-in-out_0.4s]"></span>
                </div>
              </div>
            )}
            <div ref={bottomRef} className="h-4" />
          </div>

          <InputBar onSend={handleSend} isLoading={loading} onStop={handleStop} language={language} />
        </main>
      )}
    </div>
  );
}

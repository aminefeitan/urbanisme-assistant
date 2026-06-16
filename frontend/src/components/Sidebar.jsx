import React, { useState, useRef } from "react";
import { createPortal } from "react-dom";
import { uploadPDF } from "../services/api";

export default function Sidebar({
  onNewChat,
  collapsed,
  onToggle,
  conversations = [],
  activeSessionId,
  onSelectConversation,
  onDeleteConversation,
  onPinConversation,
  user,
  onLogout,
}) {
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showMiniMenu, setShowMiniMenu] = useState(false);
  const [showConvoPopover, setShowConvoPopover] = useState(false);
  const avatarRef = useRef(null);
  const convoIconRef = useRef(null);

  const getInitials = () => {
    if (!user) return "U";
    if (user.first_name || user.last_name) {
      const f = user.first_name ? user.first_name.charAt(0).toUpperCase() : "";
      const l = user.last_name ? user.last_name.charAt(0).toUpperCase() : "";
      return f + l || "U";
    }
    if (user.name) {
      const parts = user.name.trim().split(/\s+/);
      if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
      if (parts.length === 1 && parts[0]) return parts[0][0].toUpperCase();
    }
    if (user.email) return user.email.charAt(0).toUpperCase();
    return "U";
  };

  const getAvatarColor = () => {
    if (!user) return "linear-gradient(135deg, var(--accent) 0%, #d97706 100%)";
    const name = user.first_name || user.name || "U";
    const colors = [
      "linear-gradient(135deg, #f43f5e 0%, #be123c 100%)",
      "linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)",
      "linear-gradient(135deg, #10b981 0%, #047857 100%)",
      "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
      "linear-gradient(135deg, #f59e0b 0%, #b45309 100%)",
      "linear-gradient(135deg, #06b6d4 0%, #0e7490 100%)",
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
  };

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    setUploadMsg("");
    try {
      const res = await uploadPDF(file);
      setUploadMsg("✅ " + res.message);
      setUploadSuccess(true);
    } catch (err) {
      setUploadMsg("❌ " + err.message);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const getMiniMenuStyle = () => {
    if (!avatarRef.current) return {};
    const rect = avatarRef.current.getBoundingClientRect();
    return { top: rect.top - 48, left: rect.left };
  };

  const getConvoPopoverStyle = () => {
    if (!convoIconRef.current) return {};
    const rect = convoIconRef.current.getBoundingClientRect();
    return { top: rect.top, left: rect.right + 8 };
  };

  const pinned = conversations.filter((c) => c.pinned);
  const unpinned = conversations.filter((c) => !c.pinned);

  const PinIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 17v5" />
      <path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 1 1 0 0 0 1-1V4a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1 1 1 0 0 1 1 1z" />
    </svg>
  );

  const TrashIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6h18" />
      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
      <line x1="10" y1="11" x2="10" y2="17" />
      <line x1="14" y1="11" x2="14" y2="17" />
    </svg>
  );

  const ChatIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );

  const renderItem = (convo) => (
    <button
      key={convo.id}
      className={`group relative flex items-center w-full rounded-lg border-none text-left cursor-pointer transition-all duration-200 text-[0.88rem] mb-1 overflow-hidden focus:outline-none focus:ring-2 focus:ring-accent2 p-2.5 gap-3 ${convo.id === activeSessionId
          ? "bg-surface2 text-appText font-medium"
          : "bg-transparent text-muted hover:bg-surface2 hover:text-appText"
        } ${convo.pinned ? "border-l-2 border-l-accent pl-[8px]" : ""}`}
      onClick={() => onSelectConversation(convo)}
    >
      <span className={`shrink-0 flex items-center justify-center transition-colors ${convo.id === activeSessionId ? "text-accent2" : convo.pinned ? "text-accent" : "text-muted"}`}>
        {convo.pinned ? <PinIcon /> : <ChatIcon />}
      </span>
      <div className="flex-1 min-w-0 pr-14">
        <span className="block truncate whitespace-nowrap overflow-hidden text-ellipsis leading-tight">{convo.title}</span>
      </div>
      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-l from-surface2 via-surface2 to-transparent pl-6 py-1">
        <button
          className={`p-1.5 rounded-md border-none flex items-center justify-center cursor-pointer transition-all hover:scale-110 ${convo.pinned ? "text-accent hover:bg-surface" : "text-muted hover:text-accent hover:bg-surface"}`}
          onClick={(e) => { e.stopPropagation(); onPinConversation(convo.id); }}
          title={convo.pinned ? "Désépingler" : "Épingler"}
        >
          <PinIcon />
        </button>
        <button
          className="p-1.5 rounded-md border-none text-muted hover:text-red-500 hover:bg-surface flex items-center justify-center cursor-pointer transition-all hover:scale-110"
          onClick={(e) => { e.stopPropagation(); onDeleteConversation(convo.id); }}
          title="Supprimer"
        >
          <TrashIcon />
        </button>
      </div>
    </button>
  );

  return (
    <aside className={`flex flex-col h-full bg-surface border-r border-appBorder transition-all duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)] z-40 relative backdrop-blur-xl sidebar ${collapsed ? "sidebar--collapsed" : "w-[var(--sidebar-w)]"}`}>

      {/* Header */}
      <div className="h-[72px] shrink-0 flex items-center justify-between px-4 border-b border-appBorder sidebar-header">
        <div
          className={`flex items-center gap-3 cursor-pointer overflow-hidden transition-all duration-300 ${collapsed ? "w-0 opacity-0 ml-[-8px]" : "w-auto opacity-100"}`}
          onClick={() => window.location.reload()}
          title="Actualiser"
        >
          <img src="/logo_chatbot.png" alt="Agence Urbaine" className="w-[38px] h-[38px] object-contain shrink-0" />
        </div>
        <button
          className={`w-[40px] h-[40px] rounded-xl border-none bg-transparent flex items-center justify-center cursor-pointer transition-all duration-300 text-muted hover:bg-surface2 hover:text-appText ${collapsed ? "mx-auto" : ""}`}
          onClick={onToggle}
          title={collapsed ? "Ouvrir le menu" : "Réduire le menu"}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            className={`transition-transform duration-300 ${collapsed ? "rotate-180" : ""}`}>
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">

        {/* New Chat */}
        <button
          className={`w-full flex items-center border border-appBorder bg-surface text-appText rounded-[var(--radius)] cursor-pointer transition-all duration-200 hover:bg-surface2 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-accent2 ${collapsed ? "h-[44px] justify-center p-0" : "h-[48px] px-4 gap-3"}`}
          onClick={onNewChat}
        >
          <svg className="shrink-0" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 20h9" />
            <path d="M16.376 3.622a1 1 0 0 1 3.002 3.002L7.368 18.635a2 2 0 0 1-.855.506l-2.872.838a.5.5 0 0 1-.62-.62l.838-2.872a2 2 0 0 1 .506-.854z" />
          </svg>
          {!collapsed && <span className="font-semibold text-[0.92rem]">Nouvelle conversation</span>}
        </button>

        {/* Conversation History */}
        <div className="mt-6 transition-all duration-300">
          {!collapsed && (
            <h3 className="text-[0.75rem] font-bold tracking-wider text-muted uppercase mb-3 px-1">💬 Historique</h3>
          )}

          {collapsed ? (
            /* ── Collapsed: single chat icon that opens a popover ── */
            <div className="flex justify-center">
              <button
                ref={convoIconRef}
                className={`w-[40px] h-[40px] rounded-xl border-none flex items-center justify-center cursor-pointer transition-all duration-200 ${showConvoPopover
                    ? "bg-surface2 text-accent2"
                    : "bg-transparent text-muted hover:bg-surface2 hover:text-appText"
                  }`}
                onClick={() => setShowConvoPopover((v) => !v)}
                title="Conversations"
              >
                <ChatIcon />
              </button>
            </div>
          ) : (
            /* ── Expanded: full conversation list ── */
            <div className="flex flex-col gap-0.5">
              {conversations.length === 0 ? (
                <div className="text-center py-6 text-[0.85rem] text-muted italic bg-surface2 rounded-lg">
                  Aucune conversation
                </div>
              ) : (
                <>
                  {pinned.length > 0 && (
                    <div className="mb-4">
                      <div className="text-[0.7rem] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2 px-2">Épinglées</div>
                      {pinned.map(renderItem)}
                    </div>
                  )}
                  {unpinned.length > 0 && (
                    <div className="mb-1">
                      {pinned.length > 0 && (
                        <div className="text-[0.7rem] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2 px-2">Récentes</div>
                      )}
                      {unpinned.map(renderItem)}
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* OCR Upload */}
        {!uploadSuccess && !collapsed && (
          <div className="mt-6 transition-all duration-300">
            <h3 className="text-[0.75rem] font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase mb-3 px-1">📤 OCR — Mise à jour loi</h3>
            <p className="text-[0.8rem] text-slate-500 dark:text-slate-400 mb-3 px-1 leading-relaxed">
              Utilise uniquement quand le PDF de la loi 12-90 change.
            </p>
            <label className={`w-full flex items-center justify-center py-2.5 px-4 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-lg text-[0.85rem] font-medium cursor-pointer transition-all hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-800 dark:hover:text-slate-100 ${uploading ? "opacity-70 pointer-events-none" : ""}`}>
              {uploading ? "⏳ OCR en cours..." : "📎 Charger PDF loi 12-90"}
              <input type="file" accept=".pdf" onChange={handleFile} disabled={uploading} className="hidden" />
            </label>
            {uploadMsg && <p className="mt-2 text-[0.8rem] text-amber-600 px-1 break-words">{uploadMsg}</p>}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-appBorder bg-appBg/50 backdrop-blur-sm shrink-0">
        {user ? (
          <div className={`flex items-center gap-3 w-full rounded-[var(--radius)] transition-all ${collapsed ? "justify-center p-0 bg-transparent cursor-pointer" : "p-2 bg-surface cursor-default user-profile-block"}`}>
            <div
              ref={avatarRef}
              className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-[0.95rem] shadow-sm shrink-0 transition-transform hover:scale-105"
              style={{ background: getAvatarColor(), cursor: collapsed ? "pointer" : "default" }}
              onClick={(e) => {
                if (collapsed) {
                  e.stopPropagation();
                  setShowMiniMenu(!showMiniMenu);
                }
              }}
              title={collapsed ? "Profil & Déconnexion" : ""}
            >
              {getInitials()}
            </div>
            {!collapsed && (
              <>
                <div className="flex-1 min-w-0 text-[0.92rem] font-semibold text-appText truncate user-name">
                  {user.first_name || user.name || "Utilisateur"}
                </div>
                <button
                  className="w-8 h-8 rounded-lg border-none bg-transparent flex items-center justify-center text-muted cursor-pointer transition-all hover:bg-red-500/10 hover:text-red-500 shrink-0 user-logout-icon-btn"
                  onClick={(e) => { e.stopPropagation(); setShowLogoutModal(true); }}
                  title="Déconnexion"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                    <polyline points="16 17 21 12 16 7"></polyline>
                    <line x1="21" y1="12" x2="9" y2="12"></line>
                  </svg>
                </button>
              </>
            )}
          </div>
        ) : (
          !collapsed && <span className="text-[0.85rem] text-slate-500 dark:text-slate-400 font-medium px-2">Assistant Urbanisme</span>
        )}
      </div>

      {/* ── Conversation Popover (collapsed mode) ── */}
      {collapsed && showConvoPopover && createPortal(
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-[90]"
            onClick={() => setShowConvoPopover(false)}
          />
          {/* Panel */}
          <div
            className="fixed z-[100] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xl rounded-xl py-2 w-[250px] max-h-[70vh] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600"
            style={getConvoPopoverStyle()}
          >
            {/* Header */}
            <div className="px-3 pb-2 mb-1 border-b border-slate-100 dark:border-slate-700">
              <span className="text-[0.7rem] font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase">
                💬 Conversations
              </span>
            </div>

            {conversations.length === 0 ? (
              <div className="text-center py-5 text-[0.85rem] text-slate-400 italic px-3">
                Aucune conversation
              </div>
            ) : (
              <>
                {/* Pinned */}
                {pinned.length > 0 && (
                  <div className="mb-1">
                    <div className="text-[0.65rem] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-3 pt-1 pb-1">
                      Épinglées
                    </div>
                    {pinned.map((convo) => (
                      <button
                        key={convo.id}
                        className={`w-full text-left px-3 py-2 text-[0.87rem] flex items-center gap-2.5 transition-colors cursor-pointer border-none ${convo.id === activeSessionId
                            ? "bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white font-semibold"
                            : "bg-transparent text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/60"
                          }`}
                        onClick={() => { onSelectConversation(convo); setShowConvoPopover(false); }}
                      >
                        <span className="text-amber-500 shrink-0"><PinIcon /></span>
                        <span className="truncate leading-tight">{convo.title}</span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Recent */}
                {unpinned.length > 0 && (
                  <div>
                    {pinned.length > 0 && (
                      <div className="text-[0.65rem] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-3 pt-2 pb-1">
                        Récentes
                      </div>
                    )}
                    {unpinned.map((convo) => (
                      <button
                        key={convo.id}
                        className={`w-full text-left px-3 py-2 text-[0.87rem] flex items-center gap-2.5 transition-colors cursor-pointer border-none ${convo.id === activeSessionId
                            ? "bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white font-semibold"
                            : "bg-transparent text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/60"
                          }`}
                        onClick={() => { onSelectConversation(convo); setShowConvoPopover(false); }}
                      >
                        <span className="text-slate-400 shrink-0"><ChatIcon /></span>
                        <span className="truncate leading-tight">{convo.title}</span>
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </>,
        document.body
      )}

      {/* Mini Logout Popup */}
      {collapsed && showMiniMenu && (
        <div
          className="fixed bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-lg rounded-lg py-1.5 px-3 flex items-center gap-2 cursor-pointer transition-colors z-[100] hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 text-slate-700 dark:text-slate-300 text-[0.88rem] font-medium"
          style={getMiniMenuStyle()}
          onClick={(e) => { e.stopPropagation(); setShowLogoutModal(true); setShowMiniMenu(false); }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
          <span>Log out</span>
        </div>
      )}

      {/* Logout Modal */}
      {showLogoutModal && createPortal(
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[2000] flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setShowLogoutModal(false)}
        >
          <div
            className="bg-surface rounded-2xl w-full max-w-[400px] p-6 shadow-xl animate-[cardSlideUp_0.3s_ease-out]"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-[1.2rem] font-bold text-appText mb-2">Êtes-vous sûr de vouloir vous déconnecter ?</h2>
            <p className="text-[0.95rem] text-muted mb-6 leading-relaxed">
              Se déconnecter d'Assistant Urbanisme en tant que<br />
              <strong className="text-appText">{user?.email || user?.first_name || "cet utilisateur"}</strong> ?
            </p>
            <div className="flex gap-3 justify-end">
              <button
                className="px-4 py-2 border-none rounded-lg font-medium cursor-pointer transition-colors text-[0.92rem] bg-surface2 text-appText hover:bg-appBorder"
                onClick={() => setShowLogoutModal(false)}
              >
                Annuler
              </button>
              <button
                className="px-4 py-2 border-none rounded-lg font-medium cursor-pointer transition-colors text-[0.92rem] bg-red-500 text-white hover:bg-red-600"
                onClick={() => { setShowLogoutModal(false); onLogout(); }}
              >
                Se déconnecter
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </aside>
  );
}
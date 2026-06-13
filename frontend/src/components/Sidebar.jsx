import React, { useState } from "react";
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
  const [uploadSuccess, setUploadSuccess] = useState(true); // Hidden by default as requested
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Helper to get initials
  const getInitials = () => {
    if (!user) return "U";
    const f = user.first_name ? user.first_name.charAt(0).toUpperCase() : "";
    const l = user.last_name ? user.last_name.charAt(0).toUpperCase() : "";
    return f + l || "U";
  };

  // Helper to generate a random color based on name
  const getAvatarColor = () => {
    if (!user) return "linear-gradient(135deg, var(--accent) 0%, #d97706 100%)";
    const name = user.first_name || user.name || "U";
    const colors = [
      "linear-gradient(135deg, #f43f5e 0%, #be123c 100%)", // Rose/Red
      "linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)", // Purple
      "linear-gradient(135deg, #10b981 0%, #047857 100%)", // Emerald
      "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)", // Blue
      "linear-gradient(135deg, #f59e0b 0%, #b45309 100%)", // Amber
      "linear-gradient(135deg, #06b6d4 0%, #0e7490 100%)", // Cyan
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
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

  const pinned = conversations.filter((c) => c.pinned);
  const unpinned = conversations.filter((c) => !c.pinned);

  const PinIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 17v5" />
      <path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 1 1 0 0 0 1-1V4a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1 1 1 0 0 1 1 1z" />
    </svg>
  );

  const TrashIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6h18" />
      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
      <line x1="10" y1="11" x2="10" y2="17" />
      <line x1="14" y1="11" x2="14" y2="17" />
    </svg>
  );

  const ChatIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );

  const renderItem = (convo) => (
    <button
      key={convo.id}
      className={`history-item ${convo.id === activeSessionId ? "history-item--active" : ""} ${convo.pinned ? "history-item--pinned" : ""}`}
      onClick={() => onSelectConversation(convo)}
    >
      <span className="history-icon">
        {convo.pinned ? <PinIcon /> : <ChatIcon />}
      </span>
      <div className="history-info">
        <span className="history-title">{convo.title}</span>
      </div>
      <div className="history-actions">
        <button
          className={`history-pin ${convo.pinned ? "history-pin--active" : ""}`}
          onClick={(e) => {
            e.stopPropagation();
            onPinConversation(convo.id);
          }}
          title={convo.pinned ? "Désépingler" : "Épingler"}
        >
          <PinIcon />
        </button>
        <button
          className="history-delete"
          onClick={(e) => {
            e.stopPropagation();
            onDeleteConversation(convo.id);
          }}
          title="Supprimer"
        >
          <TrashIcon />
        </button>
      </div>
    </button>
  );

  return (
    <aside className={`sidebar ${collapsed ? "sidebar--collapsed" : ""}`}>
      {/* Header */}
      <div className="sidebar-header">
        <div className="logo" onClick={() => window.location.reload()} title="Actualiser">
          <img src="/logo_chatbot.png" alt="Agence Urbaine" className="logo-icon" />
        </div>
        <button
          className="sidebar-collapse-btn"
          onClick={onToggle}
          title={collapsed ? "Ouvrir le menu" : "Réduire le menu"}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`collapse-icon ${collapsed ? "collapse-icon--rotated" : ""}`}
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="sidebar-content">
        {/* New Chat */}
        <button className="new-chat-btn" onClick={onNewChat}>
          <svg className="new-chat-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 20h9" />
            <path d="M16.376 3.622a1 1 0 0 1 3.002 3.002L7.368 18.635a2 2 0 0 1-.855.506l-2.872.838a.5.5 0 0 1-.62-.62l.838-2.872a2 2 0 0 1 .506-.854z" />
          </svg>
          {!collapsed && <span>Nouvelle conversation</span>}
        </button>

        {/* Conversation History */}
        <div className="sidebar-section history-section">
          <h3 className="sidebar-title">💬 {!collapsed && "Historique"}</h3>
          {!collapsed && (
            <div className="history-list">
              {conversations.length === 0 ? (
                <div className="history-empty">Aucune conversation</div>
              ) : (
                <>
                  {pinned.length > 0 && (
                    <div className="history-group">
                      <div className="history-group-label">Épinglées</div>
                      {pinned.map(renderItem)}
                    </div>
                  )}
                  {unpinned.length > 0 && (
                    <div className="history-group">
                      {pinned.length > 0 && (
                        <div className="history-group-label">Récentes</div>
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
        {!uploadSuccess && (
          <div className="sidebar-section">
            <h3 className="sidebar-title">📤 {!collapsed && "OCR — Mise à jour loi"}</h3>
            {!collapsed && (
              <>
                <p className="sidebar-hint">
                  Utilise uniquement quand le PDF de la loi 12-90 change.
                </p>
                <label className={`upload-btn ${uploading ? "uploading" : ""}`}>
                  {uploading ? "⏳ OCR en cours..." : "📎 Charger PDF loi 12-90"}
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFile}
                    disabled={uploading}
                    style={{ display: "none" }}
                  />
                </label>
                {uploadMsg && <p className="upload-msg">{uploadMsg}</p>}
              </>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="sidebar-footer">
        {!collapsed && user ? (
          <div className="user-profile-block">
            <div className="user-avatar-circle" style={{ background: getAvatarColor() }}>
              {getInitials()}
            </div>
            <div className="user-name">{user.first_name || user.name || "Utilisateur"}</div>
            <button
              className="user-logout-icon-btn"
              onClick={(e) => {
                e.stopPropagation();
                setShowLogoutModal(true);
              }}
              title="Déconnexion"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
            </button>
          </div>
        ) : (
          !collapsed && <span>Assistant Urbanisme</span>
        )}
      </div>

      {/* Logout Modal */}
      {showLogoutModal && (
        <div className="logout-modal-overlay" onClick={() => setShowLogoutModal(false)}>
          <div className="logout-modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="logout-modal-title">Êtes-vous sûr de vouloir vous déconnecter ?</h2>
            <p className="logout-modal-subtitle">
              Se déconnecter d'Assistant Urbanisme en tant que<br />
              <strong>{user.email || user.first_name || "cet utilisateur"}</strong> ?
            </p>
            <div className="logout-modal-actions">
              <button
                className="logout-modal-btn logout-modal-confirm"
                onClick={() => {
                  setShowLogoutModal(false);
                  onLogout();
                }}
              >
                Se déconnecter
              </button>
              <button
                className="logout-modal-btn logout-modal-cancel"
                onClick={() => setShowLogoutModal(false)}
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}


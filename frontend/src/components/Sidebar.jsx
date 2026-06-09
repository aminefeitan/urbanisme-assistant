import React, { useState } from "react";
import { uploadPDF } from "../services/api";

function timeAgo(ts) {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "À l'instant";
  if (mins < 60) return `${mins}min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  return `${days}j`;
}

export default function Sidebar({
  onNewChat,
  collapsed,
  onToggle,
  conversations = [],
  activeSessionId,
  onSelectConversation,
  onDeleteConversation,
  onPinConversation,
}) {
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState(true); // Hidden by default as requested

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
      title={convo.title}
    >
      <span className="history-icon">
        {convo.pinned ? <PinIcon /> : <ChatIcon />}
      </span>
      <div className="history-info">
        <span className="history-title">{convo.title}</span>
        <span className="history-time">{timeAgo(convo.updatedAt)}</span>
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
          <img src="/logo_agence_urbaine.png" alt="Agence Urbaine" className="logo-icon" />
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
        {!collapsed && <span>Assistant Urbanisme</span>}
      </div>
    </aside>
  );
}


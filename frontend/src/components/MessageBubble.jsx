import React, { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";

export default function MessageBubble({ role, content, onEdit, onDelete }) {
  const isUser = role === "user";
  const [isEditing, setIsEditing] = useState(false);
  const [editVal, setEditVal] = useState(content);
  const [copied, setCopied] = useState(false);
  const copyTimeoutRef = useRef(null);

  const handleSave = () => {
    if (editVal.trim() && editVal !== content) {
      onEdit(editVal);
    }
    setIsEditing(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    if (copyTimeoutRef.current) {
      clearTimeout(copyTimeoutRef.current);
    }
    copyTimeoutRef.current = setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
    };
  }, []);

  return (
    <div className={`bubble-wrap ${isUser ? "bubble-user" : "bubble-bot"}`}>
      {!isUser && (
        <div className="bot-avatar" style={{ overflow: "hidden", borderRadius: "50%", background: "#fff" }}>
          <img
            src="/logo_chatbot.png"
            alt="Bot"
            style={{ width: "100%", height: "100%", objectFit: "contain", transform: "scale(1.81)" }}
          />
        </div>
      )}
      <div className={`bubble ${isUser ? "bubble-user-inner" : "bubble-bot-inner"}`} style={{ position: "relative" }} dir="auto">
        {isUser ? (
          isEditing ? (
            <div className="edit-mode">
              <textarea
                value={editVal}
                onChange={(e) => setEditVal(e.target.value)}
                rows={3}
                style={{
                  width: "100%",
                  minWidth: "250px",
                  background: "transparent",
                  color: "inherit",
                  border: "1px solid rgba(255,255,255,0.3)",
                  borderRadius: "8px",
                  padding: "8px",
                  marginBottom: "8px",
                  fontFamily: "inherit",
                  resize: "vertical"
                }}
                dir="auto"
              />
              <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                <button onClick={() => setIsEditing(false)} style={{ padding: "6px 12px", background: "rgba(0,0,0,0.1)", border: "none", color: "inherit", borderRadius: "6px", cursor: "pointer" }}>Annuler</button>
                <button onClick={handleSave} style={{ padding: "6px 12px", background: "var(--accent2)", border: "none", color: "white", borderRadius: "6px", cursor: "pointer" }}>Envoyer</button>
              </div>
            </div>
          ) : (
            <p>{content}</p>
          )
        ) : (
          <ReactMarkdown>{content}</ReactMarkdown>
        )}

        {isUser && !isEditing && (
          <div className="msg-actions">
            <button onClick={() => setIsEditing(true)} className="action-icon-btn edit" title="Modifier">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
            </button>
            <button
              onClick={handleCopy}
              className={`action-icon-btn copy ${copied ? "copied" : ""}`}
              title={copied ? "Copié !" : "Copier"}
            >
              {copied ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6L9 17l-5-5"></path>
                </svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
              )}
            </button>
          </div>
        )}
      </div>
      {isUser && (
        <div className="user-avatar">
          <span>👤</span>
        </div>
      )}
    </div>
  );
}
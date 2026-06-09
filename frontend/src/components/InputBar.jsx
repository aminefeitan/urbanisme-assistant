import React, { useState } from "react";

export default function InputBar({ onSend, isLoading, onStop }) {
  const [text, setText] = useState("");

  const handleAction = () => {
    if (isLoading) {
      if (onStop) onStop();
      return;
    }
    const trimmed = text.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setText("");
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleAction();
    }
  };

  // Quick suggestion chips
  const suggestions = [
    "عندي مشكل ديال البناء بلا رخصة",
    "كيفاش نطلب رخصة البناء؟",
    "الجار ديالي بنى على الحد",
    "المنطقة ديالي قابلة للبناء؟",
  ];

  return (
    <div className="input-section">
      <div className="suggestions">
        {suggestions.map((s, i) => (
          <button
            key={i}
            className="suggestion-chip"
            onClick={() => !isLoading && onSend(s)}
            disabled={isLoading}
          >
            {s}
          </button>
        ))}
      </div>
      <div className="input-bar">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKey}
          placeholder="كتب شكايتك هنا... / Écris ta plainte ici..."
          disabled={isLoading}
          rows={2}
          dir="auto"
        />
        <button onClick={handleAction} disabled={!isLoading && !text.trim()} className="send-btn">
          {isLoading ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="6" width="12" height="12" rx="2" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="20" x2="12" y2="4" />
              <polyline points="6 10 12 4 18 10" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}

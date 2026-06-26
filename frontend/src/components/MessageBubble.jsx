import React, { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";

export default function MessageBubble({ role, content, onEdit, onDelete, language = "ar" }) {
  const isUser = role === "user";
  const isRTL = language === "ar";
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

  // In RTL (Arabic): bot messages align right, user messages align left
  // In LTR (French): bot messages align left, user messages align right
  const alignUser = isRTL ? "mr-auto flex-row-reverse" : "ml-auto flex-row-reverse";
  const alignBot = isRTL ? "ml-auto" : "mr-auto";

  const bubbleCorner = isUser
    ? (isRTL ? "rounded-tl-sm" : "rounded-tr-sm")
    : (isRTL ? "rounded-tr-sm" : "rounded-tl-sm");

  const actionBarPos = isRTL ? "left-4" : "right-4";

  return (
    <div className={`flex items-start gap-2.5 max-w-[780px] animate-fadeUp ${isUser ? alignUser : alignBot}`}>
      {!isUser && (
        <div className="w-[34px] h-[34px] rounded-full flex items-center justify-center text-base shrink-0 mt-0.5 overflow-hidden bg-transparent border-none">
          <img
            src="/logo_chatbot.png"
            alt="Bot"
            className="w-full h-full object-contain scale-[1.81]"
          />
        </div>
      )}
      <div className={`relative p-3 sm:p-4 rounded-[var(--radius)] leading-[1.65] text-[0.91rem] break-words group ${isUser ? `bg-userBg text-appText ${bubbleCorner} shadow-sm` : `bg-botBg border border-appBorder text-appText ${bubbleCorner} shadow-sm`} [&_h1]:text-[0.92rem] [&_h1]:font-semibold [&_h1]:text-accent [&_h1]:my-3 [&_h2]:text-[0.92rem] [&_h2]:font-semibold [&_h2]:text-accent [&_h2]:my-3 [&_h3]:text-[0.92rem] [&_h3]:font-semibold [&_h3]:text-accent [&_h3]:my-3 [&_strong]:text-accent [&_ul]:pl-[25px] [&_ul]:my-1.5 [&_ol]:pl-[25px] [&_ol]:my-1.5 [&_li]:my-[3px] [&_p]:my-1 [&_p]:whitespace-pre-wrap [&_hr]:border-t [&_hr]:border-appBorder [&_hr]:my-2.5`} dir="auto">
        {isUser ? (
          isEditing ? (
            <div className="flex flex-col gap-2">
              <textarea
                value={editVal}
                onChange={(e) => setEditVal(e.target.value)}
                rows={3}
                className="w-full min-w-[250px] bg-black/20 text-white border border-white/30 rounded-lg p-2 font-sans resize-y focus:outline-none focus:border-white/60"
                dir="auto"
              />
              <div className="flex gap-2 justify-end">
                <button onClick={() => setIsEditing(false)} className="px-3 py-1.5 bg-black/20 hover:bg-black/30 border-none text-white rounded-md cursor-pointer transition-colors text-sm">Annuler</button>
                <button onClick={handleSave} className="px-3 py-1.5 bg-sky-500 hover:bg-sky-600 border-none text-white rounded-md cursor-pointer transition-colors text-sm">Envoyer</button>
              </div>
            </div>
          ) : (
            <p className="whitespace-pre-wrap m-0">{content}</p>
          )
        ) : (
          <ReactMarkdown>{content}</ReactMarkdown>
        )}

        {isUser && !isEditing && (
          <div className={`flex gap-1.5 absolute -bottom-[18px] ${actionBarPos} bg-surface border border-appBorder p-1 rounded-lg opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-200 z-10 shadow-[0_4px_12px_rgba(0,0,0,0.1)] pointer-events-none group-hover:pointer-events-auto`}>
            <button onClick={() => setIsEditing(true)} className="bg-surface2 border-none text-muted w-[26px] h-[26px] rounded-md flex items-center justify-center cursor-pointer transition-colors hover:bg-appBorder hover:text-appText" title="Modifier">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
            </button>
            <button
              onClick={handleCopy}
              className={`bg-surface2 border-none text-muted w-[26px] h-[26px] rounded-md flex items-center justify-center cursor-pointer transition-colors hover:bg-appBorder hover:text-appText ${copied ? "!text-emerald-600 !bg-emerald-100 dark:!bg-emerald-900/30" : ""}`}
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

        {!isUser && (
          <div className={`flex gap-1.5 absolute -bottom-[18px] ${isRTL ? "right-4" : "left-4"} bg-surface border border-appBorder p-1 rounded-lg opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-200 z-10 shadow-[0_4px_12px_rgba(0,0,0,0.1)] pointer-events-none group-hover:pointer-events-auto`}>
            <button
              onClick={handleCopy}
              className={`bg-surface2 border-none text-muted w-[26px] h-[26px] rounded-md flex items-center justify-center cursor-pointer transition-colors hover:bg-appBorder hover:text-appText ${copied ? "!text-emerald-600 !bg-emerald-100 dark:!bg-emerald-900/30" : ""}`}
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
        <div className="w-[34px] h-[34px] rounded-full flex items-center justify-center text-base shrink-0 mt-0.5 border-none text-white shadow-[0_4px_10px_rgba(56,189,248,0.2)] bg-gradient-to-br from-sky-400 to-sky-600">
          <span>👤</span>
        </div>
      )}
    </div>
  );
}
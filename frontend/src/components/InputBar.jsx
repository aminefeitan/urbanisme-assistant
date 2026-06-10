import React, { useState, useRef } from "react";
import { transcribeAudio } from "../services/api";

export default function InputBar({ onSend, isLoading, onStop }) {
  const [text, setText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

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

  const toggleRecording = async () => {
    if (isRecording) {
      // Stop recording
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
    } else {
      // Start recording
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorderRef.current = new MediaRecorder(stream);
        audioChunksRef.current = [];

        mediaRecorderRef.current.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        mediaRecorderRef.current.onstop = async () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
          stream.getTracks().forEach((track) => track.stop()); // Stop mic
          setIsTranscribing(true);
          try {
            const data = await transcribeAudio(audioBlob);
            if (data && data.text) {
              setText((prev) => (prev ? prev + " " + data.text : data.text));
            }
          } catch (error) {
            console.error("Transcription error:", error);
            alert("Erreur de transcription vocale.");
          } finally {
            setIsTranscribing(false);
          }
        };

        mediaRecorderRef.current.start();
        setIsRecording(true);
      } catch (err) {
        console.error("Error accessing microphone:", err);
        alert("Impossible d'accéder au microphone.");
      }
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
            disabled={isLoading || isRecording || isTranscribing}
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
          placeholder={isRecording ? "Écoute en cours..." : isTranscribing ? "Transcription..." : "كتب شكايتك هنا... / Écris ta plainte ici..."}
          disabled={isLoading || isRecording || isTranscribing}
          rows={2}
          dir="auto"
        />
        {(!isLoading && (!text.trim() || isRecording || isTranscribing)) ? (
          <button 
            onClick={toggleRecording} 
            className={`send-btn mic-mode ${isRecording ? "recording" : ""}`}
            disabled={isTranscribing}
            title={isRecording ? "Arrêter l'enregistrement" : "Parler"}
          >
            {isTranscribing ? (
              <div className="spinner mic-spinner"></div>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"></path>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                <line x1="12" y1="19" x2="12" y2="23"></line>
                <line x1="8" y1="23" x2="16" y2="23"></line>
              </svg>
            )}
          </button>
        ) : (
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
        )}
      </div>
    </div>
  );
}

const BASE = "http://localhost:8000/api";

export async function sendMessage(message, sessionId, signal) {
  const res = await fetch(`${BASE}/chat/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, session_id: sessionId }),
    signal,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Server error");
  }
  return res.json(); // { response, session_id }
}

export async function uploadPDF(file) {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`${BASE}/ocr/upload`, { method: "POST", body: form });
  if (!res.ok) throw new Error("Upload failed");
  return res.json();
}

export async function getOCRStatus() {
  const res = await fetch(`${BASE}/ocr/status`);
  return res.json();
}

export async function clearHistory(sessionId) {
  await fetch(`${BASE}/chat/history/${sessionId}`, { method: "DELETE" });
}

export async function transcribeAudio(audioBlob) {
  const form = new FormData();
  form.append("audio", audioBlob, "audio.webm");
  const res = await fetch(`${BASE}/chat/transcribe`, { method: "POST", body: form });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Transcription failed");
  }
  return res.json(); // { text }
}

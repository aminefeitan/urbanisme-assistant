const BASE = "http://localhost:8000/api";

function getAuthHeaders() {
  const token = localStorage.getItem('authToken');
  const headers = { "Content-Type": "application/json" };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

export async function sendMessage(message, sessionId, signal, language = "ar") {
  const res = await fetch(`${BASE}/chat/`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ message, session_id: sessionId, language }),
    signal,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Server error");
  }
  return res.json(); // { response, session_id }
}

export async function uploadPDF(file, loiVersion = "12-90") {
  const form = new FormData();
  form.append("file", file);
  form.append("loi_version", loiVersion);
  
  const headers = {};
  const token = localStorage.getItem('authToken');
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE}/ocr/upload`, { 
    method: "POST", 
    headers: headers,
    body: form 
  });
  if (!res.ok) throw new Error("Upload failed");
  return res.json();
}

export async function getOCRStatus() {
  const res = await fetch(`${BASE}/ocr/status`, {
    headers: getAuthHeaders()
  });
  return res.json();
}

export async function clearHistory(sessionId) {
  await fetch(`${BASE}/chat/history/${sessionId}`, { 
    method: "DELETE",
    headers: getAuthHeaders()
  });
}

// --- Conversations (DB-based, per user) ---

export async function getConversations() {
  const res = await fetch(`${BASE}/chat/conversations`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Failed to load conversations");
  return res.json();
}

export async function deleteConversation(id) {
  const res = await fetch(`${BASE}/chat/conversations/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Failed to delete conversation");
  return res.json();
}

export async function pinConversation(id) {
  const res = await fetch(`${BASE}/chat/conversations/${id}/pin`, {
    method: "PATCH",
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Failed to pin conversation");
  return res.json();
}

export async function getConversationMessages(sessionId) {
  const res = await fetch(`${BASE}/chat/history/${sessionId}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Failed to load messages");
  return res.json();
}

export async function transcribeAudio(audioBlob) {
  const form = new FormData();
  form.append("audio", audioBlob, "audio.webm");
  
  const headers = {};
  const token = localStorage.getItem('authToken');
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE}/chat/transcribe`, { 
    method: "POST", 
    headers: headers,
    body: form 
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Transcription failed");
  }
  return res.json(); // { text }
}

// --- Auth Endpoints ---

export async function registerUser(firstName, lastName, email, password) {
  const res = await fetch(`${BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      first_name: firstName,
      last_name: lastName,
      email,
      password,
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Erreur lors de l'inscription.");
  }
  return res.json();
}

export async function loginUser(email, password) {
  const res = await fetch(`${BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Email ou mot de passe incorrect.");
  }
  return res.json();
}

export async function verifyEmail(email, code) {
  const res = await fetch(`${BASE}/auth/verify-email`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, code }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Code invalide.");
  }
  return res.json();
}

export async function sendOtp(email) {
  const res = await fetch(`${BASE}/auth/send-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to send OTP");
  }
  return res.json();
}

export async function verifyOtp(email, code) {
  const res = await fetch(`${BASE}/auth/verify-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, code }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Invalid code");
  }
  return res.json();
}

export async function getMe() {
  const res = await fetch(`${BASE}/auth/me`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    throw new Error("Not logged in");
  }
  return res.json();
}

export async function updateProfile(firstName, lastName) {
  const res = await fetch(`${BASE}/auth/profile`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify({ first_name: firstName, last_name: lastName }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Erreur lors de la mise à jour.");
  }
  return res.json();
}

// --- Admin Endpoints ---

export async function getAdminStats() {
  const res = await fetch(`${BASE}/admin/stats`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Accès refusé");
  return res.json();
}

export async function getAdminArticles(limit = 50, offset = 0, loi_version = "") {
  const url = loi_version 
    ? `${BASE}/admin/articles?limit=${limit}&offset=${offset}&loi_version=${loi_version}`
    : `${BASE}/admin/articles?limit=${limit}&offset=${offset}`;
  const res = await fetch(url, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Erreur chargement articles");
  return res.json();
}

export async function deleteAdminArticle(id) {
  const res = await fetch(`${BASE}/admin/articles/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Erreur suppression");
  return res.json();
}

export async function resetAdminArticles() {
  const res = await fetch(`${BASE}/admin/articles`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Erreur réinitialisation");
  return res.json();
}

export async function updateAdminArticle(id, titre, contenu) {
  const res = await fetch(`${BASE}/admin/articles/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify({ titre, contenu })
  });
  if (!res.ok) throw new Error("Erreur mise à jour article");
  return res.json();
}

export async function adminUploadPDF(file, loiVersion = "12-90") {
  const form = new FormData();
  form.append("file", file);
  form.append("loi_version", loiVersion);
  const headers = {};
  const token = localStorage.getItem("authToken");
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${BASE}/admin/upload-pdf`, {
    method: "POST",
    headers,
    body: form,
  });
  if (!res.ok) throw new Error("Erreur upload PDF");
  return res.json();
}

export async function getAssistantConfig() {
  const res = await fetch(`${BASE}/admin/config`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Erreur chargement configuration");
  return res.json();
}

export async function updateAssistantConfig(systemPrompt, temperature) {
  const res = await fetch(`${BASE}/admin/config`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify({ system_prompt: systemPrompt, temperature }),
  });
  if (!res.ok) throw new Error("Erreur mise à jour configuration");
  return res.json();
}

export async function getAdminUsers(limit = 50, offset = 0) {
  const res = await fetch(`${BASE}/admin/users?limit=${limit}&offset=${offset}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Erreur chargement utilisateurs");
  return res.json();
}

export async function deleteAdminUser(id) {
  const res = await fetch(`${BASE}/admin/users/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Erreur suppression utilisateur");
  return res.json();
}

export async function getPublicContent(key) {
  const res = await fetch(`${BASE}/content/${key}`);
  if (!res.ok) throw new Error("Erreur chargement contenu");
  return res.json();
}

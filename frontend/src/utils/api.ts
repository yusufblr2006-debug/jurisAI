const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;
const apiBase = `${BACKEND_URL}/api`;

let authToken: string | null = null;

export function setAuthToken(token: string | null) {
  authToken = token;
}

export function getAuthToken() {
  return authToken;
}

async function fetchJson(url: string, options?: RequestInit) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options?.headers as Record<string, string>),
  };
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }
  const res = await fetch(url, { ...options, headers });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API Error ${res.status}: ${text}`);
  }
  return res.json();
}

export const api = {
  // Auth
  register: (name: string, email: string, password: string, role: string) =>
    fetchJson(`${apiBase}/auth/register`, {
      method: 'POST',
      body: JSON.stringify({ name, email, password, role }),
    }),
  login: (email: string, password: string) =>
    fetchJson(`${apiBase}/auth/login`, {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  getMe: () => fetchJson(`${apiBase}/auth/me`),

  // Cases
  getCases: () => fetchJson(`${apiBase}/cases`),
  getCase: (id: string) => fetchJson(`${apiBase}/cases/${id}`),
  createCase: (title: string, description: string, category: string) =>
    fetchJson(`${apiBase}/cases`, {
      method: 'POST',
      body: JSON.stringify({ title, description, category }),
    }),

  // AI Analysis
  analyze: (text: string, caseId?: string) =>
    fetchJson(`${apiBase}/analyze`, {
      method: 'POST',
      body: JSON.stringify({ text, case_id: caseId }),
    }),
  analyzeEvidence: (text: string, evidenceType?: string) =>
    fetchJson(`${apiBase}/evidence/analyze`, {
      method: 'POST',
      body: JSON.stringify({ text, evidence_type: evidenceType || 'document' }),
    }),

  // Lawyers
  getLawyers: (tier?: number, specialty?: string) => {
    const params = new URLSearchParams();
    if (tier) params.append('tier', String(tier));
    if (specialty) params.append('specialty', specialty);
    const qs = params.toString();
    return fetchJson(`${apiBase}/lawyers${qs ? `?${qs}` : ''}`);
  },
  getLawyer: (id: string) => fetchJson(`${apiBase}/lawyers/${id}`),

  // Messages
  getMessages: (caseId: string) => fetchJson(`${apiBase}/messages/${caseId}`),
  sendMessage: (caseId: string, sender: string, text: string) =>
    fetchJson(`${apiBase}/messages`, {
      method: 'POST',
      body: JSON.stringify({ case_id: caseId, sender, text }),
    }),

  // Documents
  getDocuments: () => fetchJson(`${apiBase}/documents`),

  // Community
  getCommunityPosts: (category?: string) => {
    const qs = category && category !== 'All' ? `?category=${category}` : '';
    return fetchJson(`${apiBase}/community/posts${qs}`);
  },
  getCommunityPost: (id: string) => fetchJson(`${apiBase}/community/posts/${id}`),
  createCommunityPost: (title: string, category: string, content: string) =>
    fetchJson(`${apiBase}/community/posts`, {
      method: 'POST',
      body: JSON.stringify({ title, category, content }),
    }),
  replyToPost: (postId: string, content: string, isLawyer: boolean = false) =>
    fetchJson(`${apiBase}/community/posts/${postId}/reply`, {
      method: 'POST',
      body: JSON.stringify({ content, is_lawyer: isLawyer }),
    }),

  // Notifications
  getNotifications: () => fetchJson(`${apiBase}/notifications`),
  markNotifRead: (id: string) =>
    fetchJson(`${apiBase}/notifications/${id}/read`, { method: 'POST' }),
  markAllRead: () =>
    fetchJson(`${apiBase}/notifications/read-all`, { method: 'POST' }),
};

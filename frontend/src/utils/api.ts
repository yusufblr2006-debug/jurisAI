const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

const apiBase = `${BACKEND_URL}/api`;

async function fetchJson(url: string, options?: RequestInit) {
  const res = await fetch(url, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options?.headers },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API Error ${res.status}: ${text}`);
  }
  return res.json();
}

export const api = {
  login: (name: string, role: string) =>
    fetchJson(`${apiBase}/auth/login`, {
      method: 'POST',
      body: JSON.stringify({ name, role }),
    }),

  getCases: () => fetchJson(`${apiBase}/cases`),

  getCase: (id: string) => fetchJson(`${apiBase}/cases/${id}`),

  getLawyers: () => fetchJson(`${apiBase}/lawyers`),

  analyze: (text: string, caseId?: string) =>
    fetchJson(`${apiBase}/analyze`, {
      method: 'POST',
      body: JSON.stringify({ text, case_id: caseId }),
    }),

  getMessages: (caseId: string) => fetchJson(`${apiBase}/messages/${caseId}`),

  sendMessage: (caseId: string, sender: string, text: string) =>
    fetchJson(`${apiBase}/messages`, {
      method: 'POST',
      body: JSON.stringify({ case_id: caseId, sender, text }),
    }),

  getDocuments: () => fetchJson(`${apiBase}/documents`),
};

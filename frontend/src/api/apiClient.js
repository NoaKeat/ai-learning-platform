import { endpoints } from "./endpoints";


const BASE_URL = import.meta.env.VITE_API_BASE_URL;
console.log("BASE_URL =", BASE_URL);
function ensureBaseUrl() {
  if (!BASE_URL) {
    throw new Error("Missing VITE_API_BASE_URL. Create frontend/.env with VITE_API_BASE_URL=http://localhost:5000");
  }
}

async function safeJson(res) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

async function request(path, options = {}) {
  ensureBaseUrl();

  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  });

  if (!res.ok) {
    const data = await safeJson(res);
    const msg = data?.message || data?.error || `HTTP ${res.status}`;
    throw new Error(msg);
  }

  // some endpoints may return empty body
  const data = await safeJson(res);
  return data ?? null;
}

export const api = {
  register: (payload) => request(endpoints.register, { method: "POST", body: JSON.stringify(payload) }),
  getCategories: () => request(endpoints.categories),
  createPrompt: (payload) => request(endpoints.createPrompt, { method: "POST", body: JSON.stringify(payload) }),
  getHistory: (userId) => request(endpoints.history(userId)),
};

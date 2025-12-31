import { endpoints } from "./endpoints";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;
console.log("BASE_URL =", BASE_URL);

function ensureBaseUrl() {
  if (!BASE_URL) {
    throw new Error(
      "Missing VITE_API_BASE_URL. Create frontend/.env with VITE_API_BASE_URL=http://localhost:5000"
    );
  }
}

async function safeJson(res) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

/**
 * Error object enriched with HTTP info for UI routing (409 -> login, 404 -> register, etc.)
 */
function buildApiError(res, data) {
  const err = new Error(
    data?.detail ||
      data?.message ||
      data?.error ||
      `HTTP ${res.status}`
  );

  // Attach useful fields for callers
  err.status = res.status;

  // Our middleware returns ProblemDetails with extensions["code"]
  // It may come as: { ... , extensions: { code: "X", details: ... } }
  err.code = data?.code || data?.extensions?.code;
  err.details = data?.details || data?.extensions?.details;

  // Keep raw body in case you want to debug
  err.data = data;

  return err;
}

async function request(path, options = {}) {
  ensureBaseUrl();

  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  });

  const data = await safeJson(res);

  if (!res.ok) {
    throw buildApiError(res, data);
  }

  // some endpoints may return empty body
  return data ?? null;
}

export const api = {
  // Users
  register: (payload) =>
    request(endpoints.register, {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  login: (payload) =>
    request(endpoints.login, {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  // Categories
  getCategories: () => request(endpoints.categories),

  // Prompts
  createPrompt: (payload) =>
    request(endpoints.createPrompt, {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  getHistory: (userId) => request(endpoints.history(userId)),
};

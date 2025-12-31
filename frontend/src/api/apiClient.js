import { endpoints } from "./endpoints";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

function ensureBaseUrl() {
  if (!BASE_URL) {
    throw new Error(
      "Missing VITE_API_BASE_URL. Create frontend/.env with VITE_API_BASE_URL=http://localhost:8080"
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

function extractProblemFields(data) {
  const ext = data?.extensions ?? {};
  return {
    detail: data?.detail,
    code: data?.code ?? ext.code,
    details: data?.details ?? ext.details,
    traceId: data?.traceId ?? ext.traceId,
  };
}

function buildApiErrorFromResponse(res, data) {
  const p = extractProblemFields(data);

  const err = new Error(
    p.detail ||
      data?.message ||
      data?.error ||
      `HTTP ${res.status}`
  );

  err.status = res.status;
  err.code = p.code;
  err.details = p.details;
  err.traceId = p.traceId;
  err.data = data;

  return err;
}

function buildNetworkError(e) {
  const err = new Error("Network error. Please check your connection and try again.");
  err.status = 0;
  err.code = "NETWORK_ERROR";
  err.details = null;
  err.traceId = null;
  err.cause = e;
  return err;
}

async function request(path, options = {}) {
  ensureBaseUrl();

  let res;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      headers: { "Content-Type": "application/json", ...(options.headers || {}) },
      ...options,
    });
  } catch (e) {
    throw buildNetworkError(e);
  }

  const data = await safeJson(res);

  if (!res.ok) {
    throw buildApiErrorFromResponse(res, data);
  }

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

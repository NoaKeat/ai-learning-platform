import { endpoints } from "./endpoints";
import { clearUser, getToken } from "../utils/storage";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

/* -------------------- Helpers -------------------- */
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
    title: data?.title,
    detail: data?.detail,
    code: data?.code ?? ext.code,
    details: data?.details ?? ext.details,
    traceId: data?.traceId ?? ext.traceId,
  };
}

function buildApiErrorFromResponse(res, data) {
  const p = extractProblemFields(data);

  const message =
    p.detail ||
    data?.message ||
    data?.error ||
    p.title ||
    `HTTP ${res.status}`;

  const err = new Error(message);
  err.status = res.status;
  err.code = p.code || "API_ERROR";
  err.details = p.details ?? null;
  err.traceId = p.traceId ?? null;
  err.data = data ?? null;
  err.isApiError = true;
  return err;
}

function buildNetworkError(e) {
  const err = new Error("Network error. Please check your connection and try again.");
  err.status = 0;
  err.code = "NETWORK_ERROR";
  err.details = null;
  err.traceId = null;
  err.cause = e;
  err.isNetworkError = true;
  return err;
}

function isSuccessStatus(status) {
  return (status >= 200 && status < 300) || status === 304;
}

// ✅ helper: endpoints שלא צריכים Authorization בכלל
function isPublicEndpoint(path) {
  return path === endpoints.login || path === endpoints.register;
}

/* -------------------- Core request -------------------- */
async function request(path, options = {}) {
  ensureBaseUrl();

  const token = getToken ? getToken() : localStorage.getItem("token");
  const attachAuth = Boolean(token) && !isPublicEndpoint(path);

  let res;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      ...options,
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache",
        ...(attachAuth ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {}),
      },
    });
  } catch (e) {
    throw buildNetworkError(e);
  }

  const data = res.status === 304 ? null : await safeJson(res);

  // ✅ אם JWT לא תקין/פג תוקף — מנקים הכל כדי שה־UI יתעדכן
  if (res.status === 401) {
    // clearUser מוחק גם token וגם userId/userName/phone ומרים auth-changed
    if (typeof clearUser === "function") clearUser();
    else localStorage.removeItem("token");
  }

  if (!isSuccessStatus(res.status)) {
    throw buildApiErrorFromResponse(res, data);
  }

  return data ?? null;
}

/* -------------------- Public API -------------------- */
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

  me: () =>
    request(endpoints.me, {
      method: "GET",
    }),

  // Categories
  getCategories: () => request(endpoints.categories),

  // Prompts
  createPrompt: (payload) =>
    request(endpoints.createPrompt, {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  myHistory: (userId) =>
    request(`/api/prompts/history?userId=${encodeURIComponent(userId)}`),
};

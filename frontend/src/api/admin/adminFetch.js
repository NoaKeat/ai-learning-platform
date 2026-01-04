import { createApiError } from "@/api/apiErrors";
import { getAdminKey, clearAdminKey } from "./adminAuth";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

async function safeJson(res) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

export async function adminFetch(path, options = {}) {
  const hasBody = options?.body !== undefined && options?.body !== null;

  let res;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        ...(hasBody ? { "Content-Type": "application/json" } : {}),
        ...(options.headers || {}),
        "X-ADMIN-KEY": getAdminKey() || "",
      },
    });
  } catch (e) {
    throw createApiError({
      status: 0,
      code: "NETWORK_ERROR",
      message: "Network/server error. Please try again.",
      unexpected: true,
      data: { cause: String(e) },
    });
  }

  if (res.status === 401 || res.status === 403) {
    clearAdminKey();
  }

  if (!res.ok) {
    const payload = await safeJson(res);
    throw createApiError({
      status: res.status,
      code: payload?.code || payload?.Code || payload?.errorCode || "ADMIN_ERROR",
      message:
        payload?.message ||
        payload?.detail ||
        payload?.title ||
        `Request failed (HTTP ${res.status})`,
      details: payload?.details ?? payload?.errors ?? null,
      data: payload ?? null,
    });
  }

  return res;
}

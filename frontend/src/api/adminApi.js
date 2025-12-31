import { getAdminKey, clearAdminKey } from "./adminAuth";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export async function adminFetch(path, options = {}) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      ...(options.headers || {}),
      "X-ADMIN-KEY": getAdminKey() || "",
    },
  });

  if (res.status === 401) {
    clearAdminKey();
    throw new Error("ADMIN_UNAUTHORIZED");
  }

  return res;
}

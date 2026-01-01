import { adminFetch } from "./adminFetch";

// GET /api/admin/users?page=1&pageSize=10&search=...
export async function getAdminUsers(params) {
  const res = await adminFetch(`/api/admin/users?${params}`);
  return res.json();
}

// ✅ GET /api/admin/users/{userId}/prompts?page=1&pageSize=10&search=...
export async function getAdminUserPrompts(userId, { page = 1, pageSize = 10, search = "" } = {}) {
  const qs = new URLSearchParams();
  qs.set("page", String(page));
  qs.set("pageSize", String(pageSize));
  if (search) qs.set("search", search);

  const res = await adminFetch(`/api/admin/users/${userId}/prompts?${qs.toString()}`);
  return res.json();
}

// “ping” מינימלי לוודא שהמפתח עובד
export async function verifyAdminKey() {
  await adminFetch(`/api/admin/users?page=1&pageSize=1`);
}

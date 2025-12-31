export function getUserName() {
  return localStorage.getItem("userName") || "";
}

function notifyAuthChanged() {
  window.dispatchEvent(new Event("auth-changed"));
}

export function setUser(user) {
  if (!user) return;

  // Normalize id
  const id = user.id ?? user.userId ?? user.Id;
  if (id == null) throw new Error("Missing user id");

  localStorage.setItem("userId", String(id));
  if (user.name != null) localStorage.setItem("userName", String(user.name));
  if (user.phone != null) localStorage.setItem("userPhone", String(user.phone));

  // ✅ notify App.jsx to re-check auth immediately
  window.dispatchEvent(new Event("auth-changed"));
}

export function clearUser() {
  localStorage.removeItem("userId");
  localStorage.removeItem("userName");
  localStorage.removeItem("userPhone");
  window.dispatchEvent(new Event("auth-changed"));
}

export function getUserId() {
  const v = localStorage.getItem("userId");
  return v ? Number(v) : null;
}


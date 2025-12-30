export function getUserId() {
  const raw = localStorage.getItem("userId");
  return raw ? Number(raw) : null;
}


export function getUserName() {
  return localStorage.getItem("userName") || "";
}

function notifyAuthChanged() {
  window.dispatchEvent(new Event("auth-changed"));
}

export function setUser(user) {
  localStorage.setItem("userId", String(user.id));
  localStorage.setItem("userName", user.name || "");
  localStorage.setItem("userPhone", user.phone || "");
  notifyAuthChanged();
}

export function clearUser() {
  localStorage.removeItem("userId");
  localStorage.removeItem("userName");
  localStorage.removeItem("userPhone");
  notifyAuthChanged();
}

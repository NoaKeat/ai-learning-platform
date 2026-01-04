export function getUserName() {
  return localStorage.getItem("userName") || "";
}

function notifyAuthChanged() {
  window.dispatchEvent(new Event("auth-changed"));
}


export function getToken() {
  return localStorage.getItem("token") || "";
}

export function setToken(token) {
  if (!token) return;
  localStorage.setItem("token", String(token));
  notifyAuthChanged();
}

export function clearToken() {
  localStorage.removeItem("token");
  notifyAuthChanged();
}

export function setUser(user) {
  if (!user) return;

  const id = user.id ?? user.userId ?? user.Id;
  if (id == null) throw new Error("Missing user id");

  localStorage.setItem("userId", String(id));
  if (user.name != null) localStorage.setItem("userName", String(user.name));
  if (user.phone != null) localStorage.setItem("userPhone", String(user.phone));

  notifyAuthChanged();
}

export function clearUser() {
  localStorage.removeItem("userId");
  localStorage.removeItem("userName");
  localStorage.removeItem("userPhone");
  localStorage.removeItem("token"); 
  notifyAuthChanged();
}

export function getUserId() {
  const v = localStorage.getItem("userId");
  return v ? Number(v) : null;
}

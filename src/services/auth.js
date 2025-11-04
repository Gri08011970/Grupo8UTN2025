import { apiFetch } from "./api";

// Guarda / borra credenciales en localStorage
function saveAuth({ user, token }) {
  localStorage.setItem("auth", JSON.stringify({ user, token }));
}
function clearAuth() {
  localStorage.removeItem("auth");
}
function readAuth() {
  try {
    const raw = localStorage.getItem("auth");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export async function signup({ name, email, password, phone }) {
  const data = await apiFetch("auth/signup", {
    method: "POST",
    body: { name, email, password, phone },
  });
  // data = { user, token }
  saveAuth(data);
  return data.user;
}

export async function login({ email, password }) {
  const data = await apiFetch("auth/login", {
    method: "POST",
    body: { email, password },
  });
  // data = { user, token }
  saveAuth(data);
  return data.user;
}

export async function logout() {
  try {
    await apiFetch("auth/logout", { method: "POST" });
  } catch {
    // si falla el logout del server, igual limpiamos local
  }
  clearAuth();
}

export function getSavedAuth() {
  return readAuth(); // { user, token } | null
}

export function isAdminUser(user) {
  return user?.role === "admin";
}

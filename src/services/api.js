// src/services/api.js

// Resuelve automáticamente el baseURL:
// - Si existe VITE_API_URL, la usa (p.ej. "/api" o "https://algo.com/api")
// - Si estamos en localhost, usa el mock: http://localhost:4000
// - Si estamos en producción (Render), usa `${origin}/api`
const API_URL = (() => {
  const env = import.meta.env?.VITE_API_URL;
  if (env && env.trim()) return env.replace(/\/$/, ''); // sin "/" final

  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1') {
      return 'http://localhost:4000';
    }
    return `${window.location.origin}/api`;
  }
  return 'http://localhost:4000';
})();

// Une base + path sin duplicar / o dejar huecos
function joinUrl(base, path) {
  const b = base.replace(/\/$/, '');
  const p = String(path || '').replace(/^\//, '');
  return `${b}/${p}`;
}

function getAuthHeaders() {
  try {
    const saved = localStorage.getItem('auth');
    if (!saved) return {};
    const { token } = JSON.parse(saved);
    return token ? { Authorization: `Bearer ${token}` } : {};
  } catch {
    return {};
  }
}

export async function apiFetch(path, { method = 'GET', body, headers } = {}) {
  const url = joinUrl(API_URL, path);

  const res = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
      ...headers,
    },
    body: body != null ? JSON.stringify(body) : undefined,
    credentials: 'include',
  });

  if (!res.ok) {
    let message = `HTTP ${res.status}`;
    try {
      const err = await res.json();
      message = err?.message || message;
    } catch {}
    throw new Error(message);
  }

  // Puede venir 204 o respuesta vacía.
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

// Atajos cómodos
export const api = {
  get: (p, opts = {}) => apiFetch(p, { ...opts, method: 'GET' }),
  post: (p, body, opts = {}) => apiFetch(p, { ...opts, method: 'POST', body }),
  put: (p, body, opts = {}) => apiFetch(p, { ...opts, method: 'PUT', body }),
  patch: (p, body, opts = {}) => apiFetch(p, { ...opts, method: 'PATCH', body }),
  delete: (p, opts = {}) => apiFetch(p, { ...opts, method: 'DELETE' }),
};

// lo exporto por si en algún lugar lo querés mostrar/loguear
export { API_URL };


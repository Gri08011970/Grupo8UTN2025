// usa /api en producción y localhost en dev
export const API_URL = import.meta.env.VITE_API_URL ?? "/api";

// Une base + path y evita duplicar "api/api"
function joinURL(base, path) {
  const b = String(base).replace(/\/+$/, "");      // sin barra al final
  let p = String(path).replace(/^\/+/, "");        // sin barra al inicio
  if (b.endsWith("/api") && p.startsWith("api/")) p = p.slice(4); // quita api/ duplicado
  return `${b}/${p}`;
}

function readAuth() {
  try {
    const raw = localStorage.getItem("auth");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function getAuthHeaders() {
  const saved = readAuth();
  if (!saved) return {};
  const headers = {};
  if (saved.token) headers.Authorization = `Bearer ${saved.token}`;
  // 👉 Enviamos el email para que el backend pueda decidir si es admin
  if (saved.user?.email) headers["X-User-Email"] = saved.user.email;
  return headers;
}

export async function apiFetch(path, { method = "GET", body, headers } = {}) {
  const url = path.startsWith("http") ? path : joinURL(API_URL, path);

  const hasBody = body !== undefined && body !== null && method !== "GET";
  const isString = typeof body === "string";

  const finalHeaders = {
    ...(hasBody && !isString ? { "Content-Type": "application/json" } : {}),
    ...getAuthHeaders(),
    ...headers,
  };

  const finalBody = hasBody ? (isString ? body : JSON.stringify(body)) : undefined;

  const res = await fetch(url, {
    method,
    headers: finalHeaders,
    body: finalBody,
    credentials: "include",
  });

  if (!res.ok) {
    let err;
    try { err = await res.json(); } catch {}
    const msg = err?.message || `HTTP ${res.status}`;
    throw new Error(msg);
  }

  if (res.status === 204) return null;

  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

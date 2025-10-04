const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000' // backend Express

function getAuthHeaders() {
  const saved = localStorage.getItem('auth')
  if (!saved) return {}
  const { token } = JSON.parse(saved)
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export async function apiFetch(path, { method = 'GET', body, headers } = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
      ...headers
    },
    body: body ? JSON.stringify(body) : undefined,
    credentials: 'include'
  })
  if (!res.ok) {
    let message = `HTTP ${res.status}`
    try {
      const err = await res.json()
      message = err.message || message
    } catch {}
    throw new Error(message)
  }
  return res.status !== 204 ? res.json() : null
}

import { apiFetch } from './api.js'

export const login = (email, password) =>
  apiFetch('/auth/login', { method: 'POST', body: { email, password } })

export const register = (payload) =>
  apiFetch('/auth/register', { method: 'POST', body: payload })

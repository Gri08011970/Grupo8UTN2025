import { apiFetch } from './api.js'

// Compras (entidad principal)
export const listOrders = ({ page = 1, limit = 10 } = {}) =>
  apiFetch(`/orders?page=${page}&limit=${limit}`)

export const getOrder = (id) => apiFetch(`/orders/${id}`)

export const createOrder = (payload) => apiFetch('/orders', { method: 'POST', body: payload })
export const updateOrder = (id, payload) => apiFetch(`/orders/${id}`, { method: 'PUT', body: payload })
export const deleteOrder = (id) => apiFetch(`/orders/${id}`, { method: 'DELETE' })

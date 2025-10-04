import { apiFetch } from './api.js'

// Listado con paginación y filtros por categoría/subcategoría
export const listProducts = ({ page = 1, limit = 12, category, subcategory } = {}) =>
  apiFetch(`/products?page=${page}&limit=${limit}${category ? `&category=${encodeURIComponent(category)}` : ''}${subcategory ? `&subcategory=${encodeURIComponent(subcategory)}` : ''}`)

export const getProduct = (id) => apiFetch(`/products/${id}`)

export const createProduct = (payload) => apiFetch('/products', { method: 'POST', body: payload })
export const updateProduct = (id, payload) => apiFetch(`/products/${id}`, { method: 'PUT', body: payload })
export const deleteProduct = (id) => apiFetch(`/products/${id}`, { method: 'DELETE' })

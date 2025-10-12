// src/services/products.js
import { API_URL, apiFetch } from "./api.js";

/* Devuelve: { items, total, totalPages }
 */
export async function listProducts(params = {}) {
  const { page = 1, limit = 10, category, subcategory } = params;

  const usp = new URLSearchParams();
  if (category) usp.set("category", category);
  if (subcategory) usp.set("subcategory", subcategory);

  // soporta ambos estilos
  usp.set("_page", String(page));
  usp.set("_limit", String(limit));
  usp.set("page", String(page));
  usp.set("limit", String(limit));

  const url = `${API_URL}/products?${usp.toString()}`;
  const res = await fetch(url, { credentials: "include" });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  const data = await res.json();
  const items = Array.isArray(data) ? data : [];

  // json-server agrega X-Total-Count
  const totalHeader = res.headers.get("X-Total-Count");
  const total = totalHeader ? Number(totalHeader) : items.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  return { items, total, totalPages };
}

/** Lecturas “de catálogo”  */
export async function getProductsPaginated(params = {}) {
  const { page = 1, limit = 6, category, subcategory } = params;
  const { items, total } = await listProducts({ page, limit, category, subcategory });
  return { items, total };
}
export async function getProducts(params = {}) {
  const { items } = await getProductsPaginated(params);
  return items;
}
export async function getProductById(id) {
  return apiFetch(`/products/${encodeURIComponent(id)}`);
}
// Alias que ya importaban en otro lado
export const getProduct = getProductById;

/** CRUD admin */
export async function createProduct(payload) {
  return apiFetch("/products", { method: "POST", body: payload });
}
export async function updateProduct(id, payload) {
  return apiFetch(`/products/${encodeURIComponent(id)}`, { method: "PUT", body: payload });
}
export async function deleteProduct(id) {
  return apiFetch(`/products/${encodeURIComponent(id)}`, { method: "DELETE" });
}



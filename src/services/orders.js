import { apiFetch, API_URL } from "./api.js";

export async function getOrders({ page = 1, limit = 9, status } = {}) {
  const qs = new URLSearchParams();
  qs.set("_page", page);
  qs.set("_limit", limit);
  if (status) qs.set("status", status);

  const url = `${API_URL}/orders?${qs.toString()}`;

  // Usamos fetch directo para poder leer headers (apiFetch no devuelve headers)
  const res = await fetch(url, {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  let data = await res.json();
  let items = Array.isArray(data) ? data : [];
  const totalHeader = res.headers.get("X-Total-Count");

  // Si vino el header, perfecto.
  if (totalHeader !== null) {
    const total = Number(totalHeader) || items.length;
    return { items, total };
  }

  if (status) items = items.filter((o) => o.status === status);
  const total = items.length;
  const start = (page - 1) * limit;
  items = items.slice(start, start + limit);
  return { items, total };
}

export async function createOrder(payload) {
  return apiFetch("/orders", { method: "POST", body: payload });
}

export async function updateOrderStatus(id, status) {
  return apiFetch(`/orders/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: { status },
  });
}

export async function deleteOrder(id) {
  return apiFetch(`/orders/${encodeURIComponent(id)}`, { method: "DELETE" });
}




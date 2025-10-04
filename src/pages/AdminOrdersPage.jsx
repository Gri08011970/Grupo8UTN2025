
import { useEffect, useMemo, useState } from "react";
import Pagination from "../components/Pagination.jsx";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

/* ---------------------------
   Utilidades de formato
--------------------------- */
const formatCurrency = (n) =>
  new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(n ?? 0);

/* ---------------------------
   Estados en español y mapeos
--------------------------- */
const STATUS_OPTIONS = [
  { value: "pendiente", label: "pendiente" },
  { value: "pagado",    label: "pagado" },
  { value: "enviado",   label: "enviado" },
  { value: "cancelado", label: "cancelado" },
];

// Si hay datos viejos en inglés, los mostramos en español
const EN_TO_ES = {
  pending: "pendiente",
  paid: "pagado",
  shipped: "enviado",
  cancelled: "cancelado",
};
// Identidad para español (por si ya viene en es)
const ES_ID = (s) => s;

/* ---------------------------
   json-server helpers (mock)
--------------------------- */
async function mockListOrders({ page = 1, limit = 10 }) {
  const res = await fetch(`${API_URL}/orders?_page=${page}&_limit=${limit}`);
  const items = await res.json();
  const total = Number(res.headers.get("X-Total-Count") || items.length);
  const totalPages = Math.max(1, Math.ceil(total / limit));
  return { items, totalPages };
}
async function mockCreateOrder(payload) {
  const res = await fetch(`${API_URL}/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return res.json();
}
async function mockUpdateOrder(id, payload) {
  const res = await fetch(`${API_URL}/orders/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return res.json();
}
async function mockDeleteOrder(id) {
  await fetch(`${API_URL}/orders/${id}`, { method: "DELETE" });
  return true;
}

export default function AdminOrdersPage() {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [data, setData] = useState({ items: [], totalPages: 1 });
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // 👇 Ahora por defecto "pendiente" (ES)
  const empty = { customer: "", email: "", total: "", status: "pendiente" };
  const [form, setForm] = useState(empty);

  const api = useMemo(
    () => ({
      list: ({ page, limit }) => mockListOrders({ page, limit }),
      create: (p) => mockCreateOrder(p),
      update: (id, p) => mockUpdateOrder(id, p),
      remove: (id) => mockDeleteOrder(id),
    }),
    []
  );

  async function load() {
    setLoading(true);
    try {
      const res = await api.list({ page, limit });
      setData(res);
    } catch (err) {
      console.error(err);
      setData({ items: [], totalPages: 1 });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const onSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      total: Number(form.total) || 0, // guardar número
      status: form.status || "pendiente", // ya viene en ES
    };
    if (editingId) await api.update(editingId, payload);
    else await api.create(payload);
    setForm(empty);
    setEditingId(null);
    load();
  };

  const onEdit = (o) => {
    setEditingId(o.id);
    // Normalizamos el estado que venga del backend:
    // si viene en inglés lo pasamos a ES, si ya está en ES lo dejamos igual.
    const normalized =
      EN_TO_ES[o.status] ?? ES_ID(o.status ?? "pendiente");

    setForm({
      customer: o.customer || "",
      email: o.email || "",
      total: String(o.total ?? ""),
      status: normalized,
    });
  };

  const onDelete = async (id) => {
    if (!confirm("¿Eliminar la compra?")) return;
    await api.remove(id);
    load();
  };

  return (
    <section>
      <h2 className="text-xl font-semibold mb-4">Compras (ABMC + paginado)</h2>

      <form
        onSubmit={onSubmit}
        className="bg-white border rounded-xl p-4 grid sm:grid-cols-2 gap-3 mb-6"
      >
        <input
          className="border rounded px-3 py-2"
          placeholder="Cliente"
          value={form.customer}
          onChange={(e) => setForm({ ...form, customer: e.target.value })}
        />
        <input
          className="border rounded px-3 py-2"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <input
          className="border rounded px-3 py-2"
          placeholder="Total"
          value={form.total}
          onChange={(e) => setForm({ ...form, total: e.target.value })}
        />
        <select
          className="border rounded px-3 py-2"
          value={form.status}
          onChange={(e) => setForm({ ...form, status: e.target.value })}
        >
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>

        <button className="sm:col-span-2 bg-indigo-600 text-white rounded py-2">
          {editingId ? "Guardar cambios" : "Crear compra"}
        </button>
      </form>

      {loading ? (
        <p>Cargando…</p>
      ) : (
        <>
          <table className="w-full bg-white border rounded-xl overflow-hidden">
            <thead className="bg-gray-50 text-left">
              <tr>
                <th className="p-3">Cliente</th>
                <th className="p-3">Email</th>
                <th className="p-3">Total</th>
                <th className="p-3">Estado</th>
                <th className="p-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {(data.items || []).map((o) => (
                <tr key={o.id} className="border-t">
                  <td className="p-3">{o.customer}</td>
                  <td className="p-3">{o.email}</td>
                  <td className="p-3">{formatCurrency(o.total)}</td>
                  <td className="p-3">{EN_TO_ES[o.status] ?? o.status}</td>
                  <td className="p-3 flex gap-2">
                    <button
                      className="px-2 py-1 border rounded"
                      onClick={() => onEdit(o)}
                    >
                      Editar
                    </button>
                    <button
                      className="px-2 py-1 border rounded"
                      onClick={() => onDelete(o.id)}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <Pagination
            page={page}
            totalPages={data.totalPages || 1}
            onPageChange={setPage}
          />
        </>
      )}
    </section>
  );
}


import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "../services/api";

const table = "w-full text-sm";
const th =
  "text-left font-semibold text-gray-700 border-b bg-gray-50 px-3 py-2";
const td = "border-b px-3 py-2";
const select =
  "rounded-lg border px-2 py-1 text-sm bg-white hover:bg-gray-50 focus:outline-none";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState("pendiente");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Modal crear manual
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    customerName: "",
    email: "",
    phone: "",
    total: "",
    status: "pendiente",
  });

  async function load() {
    setLoading(true);
    setError("");
    try {
      const params =
        statusFilter && statusFilter !== "todos"
          ? `?status=${encodeURIComponent(statusFilter)}`
          : "";
      const data = await apiFetch(`/orders${params}`);
      setOrders(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.message || "No se pudo cargar.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  async function handleUpdateStatus(id, nextStatus) {
    try {
      await apiFetch(`/orders/${id}`, {
        method: "PATCH",
        body: { status: nextStatus },
      });
      setOrders((prev) =>
        prev.map((o) => (o.id === id ? { ...o, status: nextStatus } : o))
      );
    } catch (e) {
      setError(e.message || "No se pudo actualizar el estado.");
    }
  }

  async function handleDelete(id) {
    if (!confirm("¿Eliminar esta compra?")) return;
    try {
      await apiFetch(`/orders/${id}`, { method: "DELETE" });
      setOrders((prev) => prev.filter((o) => o.id !== id));
    } catch (e) {
      setError(e.message || "No se pudo eliminar.");
    }
  }

  function openCreateModal() {
    setForm({
      customerName: "",
      email: "",
      phone: "",
      total: "",
      status: "pendiente",
    });
    setError("");
    setShowModal(true);
  }

  async function handleCreate(e) {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      // IMPORTANTE: el backend valida estos nombres de campos
      const payload = {
        customer: (form.customerName || "").trim(),
        email: (form.email || "").trim().toLowerCase(),
        total: Number(form.total || 0),
        status: form.status,
        items: [], // explícito (el validador lo admite como optional array)
        createdAt: new Date().toISOString(),
      };

      // Sólo mandar phone si tiene contenido suficiente (min 6)
      const phoneTrim = (form.phone || "").trim();
      if (phoneTrim.length >= 6) payload.phone = phoneTrim;

      await apiFetch("/orders", { method: "POST", body: payload });

      setShowModal(false);
      await load();
    } catch (e) {
      setError(e.message || "No se pudo crear la compra.");
    } finally {
      setSaving(false);
    }
  }

  const rows = useMemo(() => orders ?? [], [orders]);

  return (
    <section className="container-narrow">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Estado:</span>
          <select
            className={select}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="pendiente">pendiente</option>
            <option value="pagado">pagado</option>
            <option value="enviado">enviado</option>
            <option value="cancelado">cancelado</option>
            <option value="todos">todos</option>
          </select>
        </div>

        <button className="btn" onClick={openCreateModal}>
          Crear compra
        </button>
      </div>

      {error && (
        <div className="mb-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-rose-900">
          {error}
        </div>
      )}

      <div className="overflow-x-auto bg-white rounded-2xl border">
        <table className={table}>
          <thead>
            <tr>
              <th className={th}>Cliente</th>
              <th className={th}>Fecha</th>
              <th className={th}>Correo electrónico</th>
              <th className={th}>Teléfono</th>
              <th className={th}>Total</th>
              <th className={th}>Estado</th>
              <th className={th}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td className={td} colSpan={7}>
                  Cargando…
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td className={td} colSpan={7}>
                  Sin resultados.
                </td>
              </tr>
            ) : (
              rows.map((o) => (
                <tr key={o.id}>
                  <td className={td}>{o.customer || o.customerName || "—"}</td>
                  <td className={td}>
                    {o.createdAt
                      ? new Date(o.createdAt).toLocaleDateString("es-AR", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        })
                      : "—"}
                  </td>
                  <td className={td}>{o.email || "—"}</td>
                  <td className={td}>{o.phone || "—"}</td>
                  <td className={td}>
                    ${" "}
                    {Number(o.total || 0).toLocaleString("es-AR", {
                      maximumFractionDigits: 0,
                    })}
                  </td>
                  <td className={td}>
                    <select
                      className={select}
                      value={o.status}
                      onChange={(e) =>
                        handleUpdateStatus(o.id, e.target.value)
                      }
                    >
                      <option value="pendiente">pendiente</option>
                      <option value="pagado">pagado</option>
                      <option value="enviado">enviado</option>
                      <option value="cancelado">cancelado</option>
                    </select>
                  </td>
                  <td className={td}>
                    <button
                      className="text-rose-600 hover:text-rose-700"
                      onClick={() => handleDelete(o.id)}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal creación */}
      {showModal && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/30 p-4">
          <form
            onSubmit={handleCreate}
            className="w-full max-w-lg rounded-2xl border bg-white p-5 space-y-3"
          >
            <h3 className="text-lg font-semibold mb-1">Ingresar venta manual</h3>

            <div>
              <label className="block text-sm font-medium">
                Nombre y apellido *
              </label>
              <input
                className="input mt-1 w-full"
                value={form.customerName}
                onChange={(e) =>
                  setForm((f) => ({ ...f, customerName: e.target.value }))
                }
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium">
                Correo electrónico *
              </label>
              <input
                className="input mt-1 w-full"
                type="email"
                value={form.email}
                onChange={(e) =>
                  setForm((f) => ({ ...f, email: e.target.value }))
                }
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium">
                Teléfono (opcional)
              </label>
              <input
                className="input mt-1 w-full"
                value={form.phone}
                onChange={(e) =>
                  setForm((f) => ({ ...f, phone: e.target.value }))
                }
                placeholder="Mínimo 6 dígitos para guardarlo"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium">Total</label>
                <input
                  className="input mt-1 w-full"
                  type="number"
                  min={0}
                  step="1"
                  value={form.total}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, total: e.target.value }))
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium">Estado</label>
                <select
                  className="input mt-1 w-full"
                  value={form.status}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, status: e.target.value }))
                  }
                >
                  <option value="pendiente">pendiente</option>
                  <option value="pagado">pagado</option>
                  <option value="enviado">enviado</option>
                  <option value="cancelado">cancelado</option>
                </select>
              </div>
            </div>

            {error && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-rose-900">
                {error}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                className="btn-outline"
                onClick={() => setShowModal(false)}
                disabled={saving}
              >
                Cancelar
              </button>
              <button type="submit" className="btn" disabled={saving}>
                {saving ? "Guardando…" : "Guardar"}
              </button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
}

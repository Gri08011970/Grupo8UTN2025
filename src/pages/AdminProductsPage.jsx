import { useEffect, useState } from "react";
import * as api from "../services/products.js";
import Pagination from "../components/Pagination.jsx";

const empty = { name: "", price: "", category: "", subcategory: "", image: "", description: "" };

export default function AdminProductsPage() {
  const [page, setPage] = useState(1);
  const [form, setForm] = useState(empty);
  const [data, setData] = useState({ items: [], totalPages: 1 });
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const res = await api.listProducts({ page, limit: 10 });
      setData(res);
    } catch (e) {
      setError(String(e.message || e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [page]);

  function onChange(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    const payload = { ...form, price: Number(form.price) || 0 };
    try {
      if (editingId) await api.updateProduct(editingId, payload);
      else await api.createProduct(payload);
      setForm(empty);
      setEditingId(null);
      await load();
    } catch (e) {
      setError(String(e.message || e));
    }
  }

  async function onDelete(id) {
    if (!confirm("¿Eliminar producto?")) return;
    await api.deleteProduct(id);
    load();
  }

  function onEdit(p) {
    setEditingId(p.id);
    setForm({
      name: p.name ?? "",
      price: p.price ?? "",
      category: p.category ?? "",
      subcategory: p.subcategory ?? "",
      image: p.image ?? "",
      description: p.description ?? "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <section className="container mx-auto max-w-6xl px-4 py-6">
      <h1 className="text-2xl font-semibold mb-6">Productos (ABMC)</h1>

      <form onSubmit={onSubmit} className="bg-white border rounded-2xl p-4 grid sm:grid-cols-2 gap-3 mb-6">
        <input className="border rounded px-3 py-2" placeholder="Nombre" value={form.name} onChange={e=>onChange("name",e.target.value)} required />
        <input className="border rounded px-3 py-2" placeholder="Precio" value={form.price} onChange={e=>onChange("price",e.target.value)} required inputMode="decimal" />
        <input className="border rounded px-3 py-2" placeholder="Categoría (mujer/hombre/unisex)" value={form.category} onChange={e=>onChange("category",e.target.value)} required />
        <input className="border rounded px-3 py-2" placeholder="Subcategoría (jeans, remeras…)" value={form.subcategory} onChange={e=>onChange("subcategory",e.target.value)} />
        <input className="border rounded px-3 py-2 sm:col-span-2" placeholder="URL de imagen" value={form.image} onChange={e=>onChange("image",e.target.value)} />
        <textarea className="border rounded px-3 py-2 sm:col-span-2" placeholder="Descripción" value={form.description} onChange={e=>onChange("description",e.target.value)} />
        {!!error && <p className="sm:col-span-2 text-red-600 text-sm">{error}</p>}
        <div className="sm:col-span-2 flex gap-2">
          <button className="bg-indigo-600 text-white rounded px-4 py-2">
            {editingId ? "Guardar cambios" : "Crear producto"}
          </button>
          {editingId && (
            <button type="button" className="border rounded px-4 py-2"
                    onClick={() => { setEditingId(null); setForm(empty); }}>
              Cancelar edición
            </button>
          )}
        </div>
      </form>

      {loading ? (
        <p>Cargando…</p>
      ) : (
        <>
          <div className="overflow-x-auto bg-white border rounded-2xl">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-left">
                <tr>
                  <th className="p-3">Producto</th>
                  <th className="p-3">Precio</th>
                  <th className="p-3">Categoría</th>
                  <th className="p-3">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((p) => (
                  <tr key={p.id} className="border-t align-top">
                    <td className="p-3 flex gap-3 items-center">
                      {p.image && <img src={p.image} alt={p.name} className="w-12 h-12 object-cover rounded" />}
                      <div>
                        <div className="font-medium">{p.name}</div>
                        {p.description && <div className="text-gray-500 line-clamp-2 max-w-[40ch]">{p.description}</div>}
                      </div>
                    </td>
                    <td className="p-3">${p.price}</td>
                    <td className="p-3">{p.category}{p.subcategory ? ` / ${p.subcategory}` : ""}</td>
                    <td className="p-3 flex gap-2">
                      <button className="px-2 py-1 border rounded" onClick={() => onEdit(p)}>Editar</button>
                      <button className="px-2 py-1 border rounded" onClick={() => onDelete(p.id)}>Eliminar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4">
            <Pagination page={page} totalPages={data.totalPages} onPageChange={setPage} />
          </div>
        </>
      )}
    </section>
  );
}

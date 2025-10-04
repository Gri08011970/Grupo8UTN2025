import { useEffect, useState } from 'react'
import * as api from '../services/products.js'
import Pagination from '../components/Pagination.jsx'

export default function AdminProductsPage() {
  const [page, setPage] = useState(1)
  const [form, setForm] = useState({ name:'', price:'', category:'', subcategory:'', image:'', description:'' })
  const [data, setData] = useState({ items: [], totalPages: 1 })
  const [loading, setLoading] = useState(false)
  const [editingId, setEditingId] = useState(null)

  const load = async () => {
    setLoading(true)
    try {
      const res = await api.listProducts({ page, limit: 10 })
      setData(res)
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [page])

  const onSubmit = async (e) => {
    e.preventDefault()
    const payload = { ...form, price: Number(form.price) }
    if (editingId) await api.updateProduct(editingId, payload)
    else await api.createProduct(payload)
    setForm({ name:'', price:'', category:'', subcategory:'', image:'', description:'' })
    setEditingId(null)
    load()
  }

  return (
    <section>
      <h2 className="text-xl font-semibold mb-4">Productos (ABMC)</h2>

      <form onSubmit={onSubmit} className="bg-white border rounded-xl p-4 grid sm:grid-cols-2 gap-3 mb-6">
        <input className="border rounded px-3 py-2" placeholder="Nombre" value={form.name} onChange={e=>setForm({...form, name:e.target.value})}/>
        <input className="border rounded px-3 py-2" placeholder="Precio" value={form.price} onChange={e=>setForm({...form, price:e.target.value})}/>
        <input className="border rounded px-3 py-2" placeholder="Categoría" value={form.category} onChange={e=>setForm({...form, category:e.target.value})}/>
        <input className="border rounded px-3 py-2" placeholder="Subcategoría" value={form.subcategory} onChange={e=>setForm({...form, subcategory:e.target.value})}/>
        <input className="border rounded px-3 py-2 sm:col-span-2" placeholder="URL Imagen" value={form.image} onChange={e=>setForm({...form, image:e.target.value})}/>
        <textarea className="border rounded px-3 py-2 sm:col-span-2" placeholder="Descripción" value={form.description} onChange={e=>setForm({...form, description:e.target.value})}/>
        <button className="sm:col-span-2 bg-indigo-600 text-white rounded py-2">{editingId ? 'Guardar cambios' : 'Crear producto'}</button>
      </form>

      {loading ? <p>Cargando…</p> : (
        <>
          <table className="w-full bg-white border rounded-xl overflow-hidden">
            <thead className="bg-gray-50 text-left">
              <tr>
                <th className="p-3">Nombre</th>
                <th className="p-3">Precio</th>
                <th className="p-3">Categoría</th>
                <th className="p-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map(p => (
                <tr key={p.id} className="border-t">
                  <td className="p-3">{p.name}</td>
                  <td className="p-3">${p.price}</td>
                  <td className="p-3">{p.category}{p.subcategory ? ` / ${p.subcategory}` : ''}</td>
                  <td className="p-3 flex gap-2">
                    <button className="px-2 py-1 border rounded" onClick={() => { setEditingId(p.id); setForm(p) }}>Editar</button>
                    <button className="px-2 py-1 border rounded" onClick={async () => { await api.deleteProduct(p.id); load() }}>Eliminar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <Pagination page={page} totalPages={data.totalPages} onPageChange={setPage} />
        </>
      )}
    </section>
  )
}

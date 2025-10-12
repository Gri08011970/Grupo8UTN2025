import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getProductsPaginated } from "../services/products.js";

const LIMIT = 6;

export default function CategoryDetailPage() {
  const { slug } = useParams(); // mujer | hombre | unisex
  const [page, setPage] = useState(1);
  const [sub, setSub] = useState("todas");
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);

  async function load() {
    setLoading(true);
    try {
      const { items, total } = await getProductsPaginated({
        category: slug,
        subcategory: sub !== "todas" ? sub : undefined,
        page,
        limit: LIMIT,
      });
      setItems(items);
      setTotal(total);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setPage(1); // cuando cambia slug o sub, volvemos a la primera página
  }, [slug, sub]);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, sub, page]);

  const totalPages = Math.max(1, Math.ceil(total / LIMIT) || 1);

  // Subcategorías dinámicas a partir de lo que vino
  const subcats = useMemo(() => {
    const set = new Set(items.map(p => p.subcategory).filter(Boolean));
    return ["todas", ...Array.from(set)];
  }, [items]);

  return (
    <section>
      <h1 className="text-xl font-semibold mb-3">Categoría: {slug?.toUpperCase()}</h1>

      {/* Chips de subcategoría */}
      <div className="flex flex-wrap gap-2 mb-4">
        {subcats.map(s => (
          <button
            key={s}
            onClick={() => setSub(s)}
            className={`px-3 py-1.5 rounded-lg border ${sub === s ? "bg-indigo-50 border-indigo-300 text-indigo-700" : "bg-white"}`}
          >
            {s[0].toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {/* Grilla */}
      {loading ? (
        <p className="text-gray-500">Cargando…</p>
      ) : items.length === 0 ? (
        <p className="text-gray-500">No hay productos para este filtro.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {items.map(p => (
            <article key={p.id} className="rounded-2xl border bg-white overflow-hidden">
              <Link to={`/producto/${p.id}`}>
                <img
                  src={p.image}
                  alt={p.name}
                  className="w-full h-56 object-cover"
                  loading="lazy"
                />
              </Link>
              <div className="p-3">
                <h3 className="font-medium">{p.name}</h3>
                <p className="text-sm text-gray-600">${Number(p.price).toLocaleString("es-AR")}</p>
                <div className="mt-2">
                  <Link to={`/producto/${p.id}`} className="text-indigo-600 text-sm">Ver</Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Paginado */}
      <div className="flex items-center gap-2 mt-4">
        <button className="btn-outline" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
          Anterior
        </button>
        <span className="text-sm text-gray-600">
          Página {page} de {totalPages}
        </span>
        <button className="btn-outline" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
          Siguiente
        </button>
      </div>
    </section>
  );
}



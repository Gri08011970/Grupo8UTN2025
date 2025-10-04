// src/pages/CategoryDetailPage.jsx
import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Pagination from "../components/Pagination.jsx";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

const SUBCATS = {
  mujer:   ["vestidos", "jeans", "shorts", "remeras", "bermudas"],
  hombre:  ["jeans", "bermudas", "remeras", "shorts"],
  unisex:  ["remeras", "shorts", "jeans", "bermudas"],
};

export default function CategoryDetailPage() {
  const { slug } = useParams();
  const [subcat, setSubcat] = useState("");  // "" = todas
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const limit = 6;
  const [totalPages, setTotalPages] = useState(1);

  const subcats = useMemo(() => SUBCATS[slug] ?? [], [slug]);

  useEffect(() => { setPage(1); }, [slug, subcat]);

  useEffect(() => {
    setLoading(true);
    const url = new URL(`${API_URL}/products`);
    url.searchParams.set("category", slug);
    if (subcat) url.searchParams.set("subcategory", subcat);
    url.searchParams.set("_page", String(page));
    url.searchParams.set("_limit", String(limit));

    fetch(url)
      .then(async (r) => {
        const data = await r.json();
        const total = Number(r.headers.get("X-Total-Count") || data.length);
        setItems(data);
        setTotalPages(Math.max(1, Math.ceil(total / limit)));
      })
      .finally(() => setLoading(false));
  }, [slug, subcat, page]);

  return (
    <section className="container mx-auto max-w-6xl px-4">
      <h2 className="text-xl font-semibold mb-4">Categoría: {slug.toUpperCase()}</h2>

      {/* Filtros */}
      <div className="mb-4 flex flex-wrap gap-2">
        <button
          className={`btn-outline ${subcat==="" ? "ring-2 ring-indigo-300" : ""}`}
          onClick={() => setSubcat("")}
        >
          Todas
        </button>
        {subcats.map(s => (
          <button
            key={s}
            className={`btn-outline capitalize ${subcat===s ? "ring-2 ring-indigo-300" : ""}`}
            onClick={() => setSubcat(s)}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Grilla */}
      {loading ? (
        <p>Cargando…</p>
      ) : items.length === 0 ? (
        <p>No hay productos para este filtro.</p>
      ) : (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map(p => (
              <article key={p.id} className="card overflow-hidden">
                <img src={p.image} alt={p.name} className="w-full aspect-[4/3] object-cover" />
                <div className="p-4">
                  <h3 className="font-semibold">{p.name}</h3>
                  <div className="flex items-center justify-between mt-2">
                    <span className="font-bold">${p.price}</span>
                    <Link to={`/producto/${p.id}`} className="text-indigo-600 hover:underline">Ver</Link>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}
    </section>
  );
}



import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { API_URL } from "../services/api.js";
import Pagination from "../components/Pagination.jsx";

const LIMIT = 6;

export default function CategoriesPage() {
  const [subcat, setSubcat] = useState("todas");
  const [page, setPage] = useState(1);
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);

  // reset página si cambia el filtro
  useEffect(() => setPage(1), [subcat]);

  useEffect(() => {
    const controller = new AbortController();

    (async () => {
      const qs = new URLSearchParams();
      if (subcat !== "todas") qs.set("subcategory", subcat);
      qs.set("_page", page);
      qs.set("_limit", LIMIT);

      const res = await fetch(`${API_URL}/products?${qs.toString()}`, { signal: controller.signal });
      const data = await res.json();
      const count = Number(res.headers.get("X-Total-Count") || data.length);
      setItems(data);
      setTotal(count);
    })().catch(() => {});

    return () => controller.abort();
  }, [subcat, page]);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(total / LIMIT)),
    [total]
  );

  return (
    <section className="container mx-auto max-w-6xl px-4 py-6">
      <h1 className="text-xl font-semibold mb-4">Categorías</h1>

      <div className="flex gap-2 mb-4">
        {["todas","vestidos","jeans","shorts","remeras","bermudas"].map((s) => (
          <button
            key={s}
            className={`chip ${s===subcat ? "chip-active" : ""}`}
            onClick={() => setSubcat(s)}
          >
            {s[0].toUpperCase()+s.slice(1)}
          </button>
        ))}
      </div>

      {items.length === 0 && <p>No hay productos para este filtro.</p>}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map(p => (
          <Link key={p.id} to={`/producto/${p.id}`} className="card">
            <img src={p.image} alt={p.name} className="rounded-xl w-full h-48 object-cover" />
            <div className="mt-2">
              <h3 className="font-medium">{p.name}</h3>
              <p className="text-sm text-gray-500">$ {p.price?.toLocaleString("es-AR")}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-6">
        <Pagination page={page} totalPages={totalPages} onChange={setPage} />
      </div>
    </section>
  );
}

// src/pages/ProductDetailPage.jsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export default function ProductDetailPage() {
  const { id } = useParams();
  const [prod, setProd] = useState(null);
  const [loading, setLoading] = useState(true);
  const { addItem } = useCart();

  useEffect(() => {
    let canceled = false;

    async function load() {
      setLoading(true);
      try {
        // 1) /products/:id directo
        let r = await fetch(`${API_URL}/products/${id}`);
        if (r.ok) {
          const data = await r.json();
          if (!canceled) setProd(data);
          return;
        }

        // 2) /products/:idNum si el id es convertible a número
        const idNum = Number(id);
        if (!Number.isNaN(idNum)) {
          r = await fetch(`${API_URL}/products/${idNum}`);
          if (r.ok) {
            const data = await r.json();
            if (!canceled) setProd(data);
            return;
          }
        }

        // 3) /products?id=... (array) -> tomo el primero
        r = await fetch(`${API_URL}/products?id=${encodeURIComponent(id)}`);
        if (r.ok) {
          const arr = await r.json();
          if (!canceled) setProd(arr[0] || null);
        }
      } finally {
        if (!canceled) setLoading(false);
      }
    }

    load();
    return () => { canceled = true; };
  }, [id]);

  if (loading) return <section className="container mx-auto max-w-6xl px-4">Cargando…</section>;
  if (!prod) return <section className="container mx-auto max-w-6xl px-4">No encontrado.</section>;

  return (
    <section className="container mx-auto max-w-6xl px-4">
      <div className="card p-4 grid md:grid-cols-2 gap-6">
        <img src={prod.image} alt={prod.name} className="w-full rounded-xl border object-cover" />
        <div>
          <h1 className="text-2xl font-bold">{prod.name}</h1>
          <p className="text-gray-600 mt-2">{prod.description}</p>
          <p className="mt-4 text-xl font-semibold">${prod.price}</p>
          <button className="btn mt-4" onClick={() => addItem(prod, 1)}>
            Agregar al carrito
          </button>
        </div>
      </div>
    </section>
  );
}


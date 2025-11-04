import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getProductById } from "../services/products.js";
import { useCart } from "../context/CartContext.jsx";

export default function ProductDetailPage() {
  const { id } = useParams();
  const { add } = useCart();
  const [p, setP] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const data = await getProductById(id);
        if (alive) setP(data);
      } catch (e) {
        console.error(e);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [id]);

  if (loading) return <p>Cargando…</p>;
  if (!p) return <p>Producto no encontrado.</p>;

  const onAdd = () => add(p, 1);

  return (
    <section className="grid md:grid-cols-2 gap-6">
      <div className="rounded-2xl overflow-hidden bg-white border">
        <img
          src={p.image}
          alt={p.name}
          className="w-full h-[480px] object-cover"
        />
      </div>

      <div>
        <h1 className="text-2xl font-semibold mb-2">{p.name}</h1>
        <p className="text-gray-600 mb-4">{p.description}</p>
        <p className="text-xl font-bold mb-6">
          $ {Number(p.price || 0).toLocaleString("es-AR")}
        </p>

        {/* CONTENEDOR DEL CTA */}
        <div className="rounded-2xl border bg-white p-4 max-w-sm">
          <button onClick={onAdd} className="btn-primary w-full">
            Agregar al carrito
          </button>
          <p className="text-xs text-gray-500 mt-2">
            Envíos a todo el país. Cambios sin costo dentro de los 30 días.
          </p>
        </div>
      </div>
    </section>
  );
}


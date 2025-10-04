
// src/pages/CartPage.jsx
import { useCart } from "../context/CartContext.jsx";

export default function CartPage() {
  const { items, updateQty, removeItem, clear, subtotal } = useCart();

  return (
    <section className="container mx-auto max-w-6xl px-4">
      <h2 className="text-2xl font-bold mb-4">Carrito</h2>

      {items.length === 0 ? (
        <p>Tu carrito está vacío.</p>
      ) : (
        <>
          <div className="card divide-y">
            {items.map(it => (
              <div key={it.id} className="flex items-center gap-4 p-3">
                <img src={it.image} alt={it.name} className="w-20 h-16 object-cover rounded border" />
                <div className="flex-1">
                  <p className="font-medium">{it.name}</p>
                  <p className="text-sm text-gray-600">${it.price}</p>
                </div>
                <input
                  type="number"
                  min={1}
                  value={it.qty}
                  onChange={(e) => updateQty(it.id, Number(e.target.value))}
                  className="w-20 border rounded px-2 py-1"
                />
                <div className="w-24 text-right font-semibold">
                  ${it.qty * Number(it.price)}
                </div>
                <button className="btn-outline" onClick={() => removeItem(it.id)}>Eliminar</button>
              </div>
            ))}
          </div>

          <div className="mt-6 flex items-center justify-between">
            <button className="btn-outline" onClick={clear}>Vaciar carrito</button>
            <div className="text-right">
              <p className="text-lg">Subtotal: <span className="font-semibold">${subtotal}</span></p>
              <button className="btn mt-2">Finalizar compra</button>
            </div>
          </div>
        </>
      )}
    </section>
  );
}

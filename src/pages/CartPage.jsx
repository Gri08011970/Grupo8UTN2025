import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { createOrder } from "../services/orders.js";
import { getProfile, savePhone } from "../services/profile.js";

export default function CartPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    items,
    increase,
    decrease,
    removeItem,
    clearCart,
    total: cartTotal,
  } = useCart();

  // Datos de checkout
  const [customer, setCustomer] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  // UI
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const bannerRef = useRef(null);

  // Perfil a partir de sesión + perfil guardado
  useEffect(() => {
    const uName = user?.name?.trim?.() || "";
    const uEmail = user?.email?.trim?.() || "";
    setCustomer((prev) => (prev || uName));
    setEmail((prev) => (prev || uEmail));

    if (uEmail) {
      const p = getProfile(uEmail);
      if (p?.phone) setPhone(p.phone);
      // Si no hubiera name guardado y no vino de user, tratamos de usarlo
      if (!uName && p?.name) setCustomer(p.name);
    }
  }, [user?.name, user?.email]);

  // Autoguardar teléfono cuando cambia (si hay email)
  useEffect(() => {
    if (!email) return;
    // Guardamos con  “debounce” manual
    const t = setTimeout(() => {
      if (phone && phone.trim()) {
        savePhone({ email, phone: phone.trim(), name: customer?.trim?.() });
      }
    }, 300);
    return () => clearTimeout(t);
  }, [email, phone, customer]);

  const subtotal = useMemo(() => cartTotal, [cartTotal]);
  const envio = 0;
  const total = useMemo(() => subtotal + envio, [subtotal]);

  // dentro de CartPage.jsx
const handleCheckout = async (e) => {
  e.preventDefault();
  setSuccessMsg("");
  setErrorMsg("");

  if (!user) {
    navigate("/login", { replace: true, state: { next: "/carrito" } });
    return;
  }
  if (!customer?.trim() || !email?.trim()) {
    setErrorMsg("Completá tu nombre y email para finalizar la compra.");
    bannerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    return;
  }
  if (items.length === 0) {
    setErrorMsg("Tu carrito está vacío.");
    bannerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    return;
  }

  setLoading(true);
  try {
    const payload = {
      customer: customer.trim(),
      email: email.trim().toLowerCase(),
      total,
      items: items.map(({ id, name, price, qty, image }) => ({
        id,
        name,
        price,
        qty,
        image,
      })),
      status: "pendiente",
      createdAt: new Date().toISOString(),
    };

    const phoneTrim = (phone || "").trim();
    if (phoneTrim.length >= 6) payload.phone = phoneTrim;

    await createOrder(payload);

    clearCart();
    setSuccessMsg(
      "¡Pedido realizado con éxito! En breve nos comunicaremos con vos. ¡Gracias por tu compra!"
    );
    bannerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  } catch (err) {
    console.error(err);
    setErrorMsg(err?.message || "No pudimos procesar tu compra. Intentalo de nuevo.");
    bannerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  } finally {
    setLoading(false);
  }
};


  return (
    <section className="max-w-6xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Carrito</h1>

      {/* Banners */}
      <div ref={bannerRef} className="space-y-3 mb-4">
        {successMsg && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-900">
            {successMsg}
          </div>
        )}
        {errorMsg && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-rose-900">
            {errorMsg}
          </div>
        )}
        {!user && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-900">
            Para finalizar la compra, primero{" "}
            <Link className="underline font-medium" to="/login">
              iniciá sesión
            </Link>{" "}
            o{" "}
            <Link className="underline font-medium" to="/signup">
              registrate
            </Link>.
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista de items */}
        <div className="lg:col-span-2 rounded-2xl border bg-white p-4">
          {items.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-500 mb-3">Tu carrito está vacío.</p>
              <Link to="/categoria/mujer" className="btn-primary">
                Ir a comprar
              </Link>
            </div>
          ) : (
            <ul className="divide-y">
              {items.map((p) => (
                <li key={p.id} className="py-4 flex gap-4 items-center">
                  <img
                    src={p.image}
                    alt={p.name}
                    className="w-20 h-20 object-cover rounded-xl border"
                  />
                  <div className="flex-1">
                    <p className="font-medium">{p.name}</p>
                    <p className="text-sm text-gray-500">
                      $ {Number(p.price ?? 0).toLocaleString("es-AR")}
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <button
                        className="btn-outline"
                        onClick={() => decrease(p.id)}
                        aria-label="Restar unidad"
                      >
                        −
                      </button>
                      <span className="w-10 text-center">{p.qty}</span>
                      <button
                        className="btn-outline"
                        onClick={() => increase(p.id)}
                        aria-label="Sumar unidad"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="font-semibold">
                      $ {(Number(p.price ?? 0) * Number(p.qty ?? 1)).toLocaleString("es-AR")}
                    </p>
                    <button
                      className="mt-2 text-sm text-rose-600 hover:text-rose-700"
                      onClick={() => removeItem(p.id)}
                    >
                      Quitar
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Resumen / Checkout */}
        <aside className="rounded-2xl border bg-white p-4 h-fit">
          <h2 className="text-lg font-semibold mb-3">Resumen</h2>

          <form onSubmit={handleCheckout} className="space-y-3">
            <div>
              <label htmlFor="customer" className="block text-sm font-medium text-gray-700">
                Nombre y apellido
              </label>
              <input
                id="customer"
                className="input mt-1"
                value={customer}
                onChange={(e) => setCustomer(e.target.value)}
                autoComplete="name"
                placeholder="Tu nombre"
                required
                readOnly={!!user?.name} // si viene de sesión, evitar reingreso
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Correo electrónico
              </label>
              <input
                id="email"
                className="input mt-1"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                placeholder="tu@correo.com"
                required
                readOnly={!!user?.email}
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Teléfono (opcional)
              </label>
              <input
                id="phone"
                className="input mt-1"
                placeholder="Ej: 1155555555"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                autoComplete="tel"
                inputMode="tel"
              />
            </div>

            <div className="mt-4 border-t pt-3 space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>$ {subtotal.toLocaleString("es-AR")}</span>
              </div>
              <div className="flex justify-between">
                <span>Envío</span>
                <span>$ {envio.toLocaleString("es-AR")}</span>
              </div>
              <div className="flex justify-between font-semibold text-base pt-1">
                <span>Total</span>
                <span>$ {total.toLocaleString("es-AR")}</span>
              </div>
            </div>

            <div className="pt-3">
              <button
                type="submit"
                className="btn-primary w-full"
                disabled={loading || items.length === 0 || !user}
                title={!user ? "Iniciá sesión para finalizar" : undefined}
              >
                {loading ? "Procesando…" : "Finalizar compra"}
              </button>

              {!user && (
                <p className="text-xs text-gray-500 mt-2">
                  Debés{" "}
                  <Link className="underline" to="/login">
                    iniciar sesión
                  </Link>{" "}
                  para continuar.
                </p>
              )}
            </div>
          </form>
        </aside>
      </div>
    </section>
  );
}

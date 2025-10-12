import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "./AuthContext.jsx";

const CartContext = createContext(null);

// una clave por usuario; si no hay user => "guest"
const keyFor = (email) => `cart:${email || "guest"}`;

export function CartProvider({ children }) {
  const { user } = useAuth();
  const email = user?.email ?? null;

  const [items, setItems] = useState([]);
  const prevEmailRef = useRef(email);

  // Cargar carrito cada vez que cambie el email (login/logout)
  useEffect(() => {
    const k = keyFor(email);
    const raw = localStorage.getItem(k);
    setItems(raw ? JSON.parse(raw) : []);
    prevEmailRef.current = email;
  }, [email]);

  // Guardar carrito bajo la clave del usuario actual
  useEffect(() => {
    const k = keyFor(email);
    localStorage.setItem(k, JSON.stringify(items));
  }, [items, email]);

  // --- acciones básicas ---
  const add = (product, qty = 1) =>
    setItems((prev) => {
      const i = prev.findIndex((p) => p.id === product.id);
      if (i >= 0) {
        const copy = [...prev];
        copy[i] = { ...copy[i], qty: copy[i].qty + qty };
        return copy;
      }
      return [...prev, { ...product, qty }];
    });

  const setQty = (id, qty) =>
    setItems((prev) => prev.map((p) => (p.id === id ? { ...p, qty: Math.max(1, qty) } : p)));

  const increase = (id) =>
    setItems((prev) => prev.map((p) => (p.id === id ? { ...p, qty: p.qty + 1 } : p)));

  const decrease = (id) =>
    setItems((prev) =>
      prev.map((p) => (p.id === id ? { ...p, qty: Math.max(1, p.qty - 1) } : p))
    );

  const removeItem = (id) => setItems((prev) => prev.filter((p) => p.id !== id));

  // Limpia el carrito en memoria y opcionalmente en storage
  const clearCart = (purgeStorage = false) => {
    setItems([]);
    if (purgeStorage) {
      localStorage.removeItem(keyFor(email));
    }
  };

  // Limpia el carrito de guest en storage (para que no “herede” cosas un usuario nuevo)
  const clearGuestCart = () => {
    localStorage.removeItem(keyFor(null));
  };

  const count = items.reduce((a, b) => a + b.qty, 0);
  const total = items.reduce((a, b) => a + b.qty * (b.price ?? 0), 0);

  const value = useMemo(
    () => ({
      items,
      add,
      setQty,
      increase,
      decrease,
      removeItem,
      clearCart,
      clearGuestCart,
      count,
      total,
    }),
    [items, email]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart debe usarse dentro de <CartProvider>");
  return ctx;
}

import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "./AuthContext.jsx";

const CartContext = createContext(null);

// storage key por usuario (o "guest")
const keyFor = (email) => `cart:${email || "guest"}`;

// lectura segura de localStorage
function readCart(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

// merge por id sumando cantidades
function mergeItems(a = [], b = []) {
  const map = new Map();
  [...a, ...b].forEach((p) => {
    const prev = map.get(p.id);
    if (prev) {
      map.set(p.id, { ...prev, qty: (Number(prev.qty) || 0) + (Number(p.qty) || 0) });
    } else {
      map.set(p.id, { ...p, qty: Number(p.qty) || 1 });
    }
  });
  return [...map.values()];
}

export function CartProvider({ children }) {
  const auth = useAuth(); // no desestructurar directo, puede ser null al inicio
  const email = auth?.user?.email ?? null;

  const [items, setItems] = useState([]);
  const prevEmailRef = useRef(email);

  // Manejo de cambios de identidad (guest ↔ user)
  useEffect(() => {
    const prevEmail = prevEmailRef.current;

    // Primera carga
    if (prevEmail === email && items.length === 0) {
      setItems(readCart(keyFor(email)));
      return;
    }

    // guest -> login (migrar guest al usuario)
    if (prevEmail == null && email) {
      const guest = readCart(keyFor(null));
      const user = readCart(keyFor(email));
      const merged = mergeItems(user, guest);
      setItems(merged);
      localStorage.setItem(keyFor(email), JSON.stringify(merged));
      localStorage.removeItem(keyFor(null)); // limpiar guest para no “volver” después
    }
    // user -> logout (volver a mostrar carrito de guest si existía)
    else if (prevEmail && email == null) {
      setItems(readCart(keyFor(null)));
    }
    // cambio de usuario A -> usuario B
    else if (prevEmail && email && prevEmail !== email) {
      setItems(readCart(keyFor(email)));
    }

    prevEmailRef.current = email;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email]);

  // Persistencia continua / clave del usuario actual
  useEffect(() => {
    localStorage.setItem(keyFor(email), JSON.stringify(items));
  }, [items, email]);

  // --- acciones ---
  const add = (product, qty = 1) =>
    setItems((prev) => {
      const i = prev.findIndex((p) => p.id === product.id);
      if (i >= 0) {
        const copy = [...prev];
        copy[i] = { ...copy[i], qty: Number(copy[i].qty || 0) + Number(qty || 1) };
        return copy;
      }
      return [...prev, { ...product, qty: Number(qty) || 1 }];
    });

  const setQty = (id, qty) =>
    setItems((prev) =>
      prev.map((p) => (p.id === id ? { ...p, qty: Math.max(1, Number(qty) || 1) } : p))
    );

  const increase = (id) =>
    setItems((prev) => prev.map((p) => (p.id === id ? { ...p, qty: Number(p.qty || 0) + 1 } : p)));

  const decrease = (id) =>
    setItems((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, qty: Math.max(1, Number(p.qty || 1) - 1) } : p
      )
    );

  const removeItem = (id) => setItems((prev) => prev.filter((p) => p.id !== id));

  // Limpia el carrito actual y opcionalmente su storage
  const clearCart = (purgeStorage = false) => {
    setItems([]);
    if (purgeStorage) localStorage.removeItem(keyFor(email));
  };

  // Limpia explícitamente el carrito guest 
  const clearGuestCart = () => {
    localStorage.removeItem(keyFor(null));
  };

  const count = items.reduce((a, b) => a + (Number(b.qty) || 0), 0);
  const total = items.reduce((a, b) => a + (Number(b.qty) || 0) * (Number(b.price) || 0), 0);

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

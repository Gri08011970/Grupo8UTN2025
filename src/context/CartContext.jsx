// src/context/CartContext.jsx
import { createContext, useContext, useEffect, useMemo, useState } from "react";

const LS_KEY = "cart:v1";
export const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem(LS_KEY)) || []; }
    catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = (product, qty = 1) => {
    setItems(prev => {
      const i = prev.findIndex(x => x.id === product.id);
      if (i >= 0) {
        const copy = [...prev];
        copy[i] = { ...copy[i], qty: copy[i].qty + qty };
        return copy;
      }
      const { id, name, price, image } = product;
      return [...prev, { id, name, price, image, qty }];
    });
  };

  const updateQty = (id, qty) => {
    setItems(prev => {
      if (qty <= 0) return prev.filter(x => x.id !== id);
      return prev.map(x => (x.id === id ? { ...x, qty } : x));
    });
  };

  const removeItem = (id) => setItems(prev => prev.filter(x => x.id !== id));
  const clear = () => setItems([]);

  const { count, subtotal } = useMemo(() => ({
    count: items.reduce((a, b) => a + b.qty, 0),
    subtotal: items.reduce((a, b) => a + b.qty * (Number(b.price) || 0), 0),
  }), [items]);

  const value = { items, addItem, updateQty, removeItem, clear, count, subtotal };
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = () => useContext(CartContext);

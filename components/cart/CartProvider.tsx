"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { CartItem } from "@/lib/types/types";

// ... (keep your existing interfaces)

export function CartProvider({ children }) {
  // Lazy load cart to avoid hydration flicker
  const [items, setItems] = useState<CartItem[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      return JSON.parse(localStorage.getItem("cart") || "[]");
    } catch {
      return [];
    }
  });

  // Persist to localStorage
  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem("cart", JSON.stringify(items));
    }
  }, [items, isHydrated]);

  const addItem = useCallback((item: CartItem) => {
    setItems(prev => {
      const existing = prev.find(i => i.productId === item.productId);

      const safeQty = Math.max(1, Number(item.quantity) || 1);
      const safeStock = item.stock ?? Infinity;

      if (existing) {
        const newQty = Math.min(existing.quantity + safeQty, safeStock);
        return prev.map(i =>
          i.productId === item.productId ? { ...i, quantity: newQty } : i
        );
      }

      return [
        ...prev,
        {
          ...item,
          key: uuidv4(),
          quantity: Math.min(safeQty, safeStock),
        },
      ];
    });
  }, []);

  const increment = useCallback((key: string) => {
    setItems(prev =>
      prev.map(i =>
        i.key === key
          ? { ...i, quantity: Math.min(i.quantity + 1, i.stock ?? Infinity) }
          : i
      )
    );
  }, []);

  const decrement = useCallback((key: string) => {
    setItems(prev =>
      prev
        .map(i => (i.key === key ? { ...i, quantity: i.quantity - 1 } : i))
        .filter(i => i.quantity > 0)
    );
  }, []);

  const removeItem = useCallback(
    (key: string) => setItems(prev => prev.filter(i => i.key !== key)),
    []
  );

  const clearCart = useCallback(() => setItems([]), []);

  // Derived values
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const total = items.reduce(
    (sum, i) => sum + Math.max(0, Number(i.price) || 0) * i.quantity,
    0
  );
  const isEmpty = items.length === 0;

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        total,
        isEmpty,
        addItem,
        increment,
        decrement,
        removeItem,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}
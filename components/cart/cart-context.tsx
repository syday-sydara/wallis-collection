"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
  useCallback,
} from "react";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  variants?: Record<string, string>;
  key: string; // unique identifier for variant combination
}

interface CartContextType {
  items: CartItem[];
  itemCount: number;
  total: number;
  isEmpty: boolean;
  addItem: (item: CartItem) => void;
  increment: (key: string) => void;
  decrement: (key: string) => void;
  removeItem: (key: string) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  // Load from localStorage safely
  useEffect(() => {
    try {
      const stored = localStorage.getItem("cart");
      if (stored) setItems(JSON.parse(stored));
    } catch {
      setItems([]);
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    const handler = setTimeout(() => {
      try {
        localStorage.setItem("cart", JSON.stringify(items));
      } catch {}
    }, 100);
    return () => clearTimeout(handler);
  }, [items]);

  const addItem = useCallback((item: CartItem) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.key === item.key);
      if (existing) {
        return prev.map((i) =>
          i.key === item.key ? { ...i, quantity: i.quantity + item.quantity } : i
        );
      }
      return [...prev, item];
    });
  }, []);

  const increment = useCallback((key: string) => {
    setItems((prev) =>
      prev.map((i) => (i.key === key ? { ...i, quantity: i.quantity + 1 } : i))
    );
  }, []);

  const decrement = useCallback((key: string) => {
    setItems((prev) =>
      prev
        .map((i) =>
          i.key === key ? { ...i, quantity: i.quantity - 1 } : i
        )
        .filter((i) => i.quantity > 0)
    );
  }, []);

  const removeItem = useCallback((key: string) => {
    setItems((prev) => prev.filter((i) => i.key !== key));
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  // Memoized derived state
  const itemCount = useMemo(() => items.reduce((sum, i) => sum + i.quantity, 0), [items]);
  const total = useMemo(() => items.reduce((sum, i) => sum + i.price * i.quantity, 0), [items]);
  const isEmpty = useMemo(() => items.length === 0, [items]);

  return (
    <CartContext.Provider
      value={{ items, itemCount, total, isEmpty, addItem, increment, decrement, removeItem, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { CartItem } from "@/lib/types/types";
import { v4 as uuidv4 } from "uuid";

interface CartContextType {
  items: CartItem[];
  itemCount: number;
  total: number;
  isEmpty: boolean;
  addItem: (item: CartItem, stock?: number) => void;
  increment: (key: string, stock?: number) => void;
  decrement: (key: string) => void;
  removeItem: (key: string) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("cart");
    if (stored) setItems(JSON.parse(stored));
  }, []);

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(items));
  }, [items]);

  const addItem = (item: CartItem, stock = Infinity) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.key === item.key);
      if (existing) {
        const qty = Math.min(existing.quantity + item.quantity, stock);
        return prev.map((i) => i.key === item.key ? { ...i, quantity: qty } : i);
      }
      return [...prev, { ...item, key: item.key || uuidv4(), quantity: Math.min(item.quantity, stock) }];
    });
  };

  const increment = (key: string, stock = Infinity) => {
    setItems((prev) =>
      prev.map((i) => (i.key === key ? { ...i, quantity: Math.min(i.quantity + 1, stock) } : i))
    );
  };

  const decrement = (key: string) => {
    setItems((prev) =>
      prev
        .map((i) => (i.key === key ? { ...i, quantity: i.quantity - 1 } : i))
        .filter((i) => i.quantity > 0)
    );
  };

  const removeItem = (key: string) => setItems((prev) => prev.filter((i) => i.key !== key));
  const clearCart = () => setItems([]);

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const isEmpty = items.length === 0;

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
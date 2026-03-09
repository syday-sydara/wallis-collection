"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface CartItem {
  id: string;
  name: string;
  price: number; // Price in Naira
  quantity: number;
  image?: string;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  increment: (id: string) => void;
  decrement: (id: string) => void;
  clearCart: () => void;
  total: number;
  itemCount: number;
  isEmpty: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  /* --------------------------------------------- */
  /* Load cart from localStorage on mount          */
  /* --------------------------------------------- */
  useEffect(() => {
    const stored = localStorage.getItem("cart");
    if (stored) {
      try {
        setItems(JSON.parse(stored));
      } catch {
        console.error("Failed to parse cart from localStorage");
      }
    }
  }, []);

  /* --------------------------------------------- */
  /* Save cart to localStorage whenever it changes */
  /* --------------------------------------------- */
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(items));
  }, [items]);

  /* --------------------------------------------- */
  /* Cart Actions                                  */
  /* --------------------------------------------- */

  const addItem = (item: CartItem) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) =>
          i.id === item.id
            ? { ...i, quantity: i.quantity + item.quantity }
            : i
        );
      }
      return [...prev, item];
    });
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id);
      return;
    }
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, quantity } : i))
    );
  };

  const increment = (id: string) => {
    updateQuantity(id, (items.find((i) => i.id === id)?.quantity || 0) + 1);
  };

  const decrement = (id: string) => {
    updateQuantity(id, (items.find((i) => i.id === id)?.quantity || 0) - 1);
  };

  const clearCart = () => setItems([]);

  /* --------------------------------------------- */
  /* Derived Values                                */
  /* --------------------------------------------- */

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const isEmpty = items.length === 0;

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        increment,
        decrement,
        clearCart,
        total,
        itemCount,
        isEmpty,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

/* --------------------------------------------- */
/* Custom Hook                                   */
/* --------------------------------------------- */
export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
}

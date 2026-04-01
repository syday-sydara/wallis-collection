"use client";

import { createContext, useContext, useState, ReactNode, PropsWithChildren } from "react";
import { Cart, CartItem } from "./types";

interface CartContextProps {
  cart: Cart;
  addItem: (item: CartItem) => void;
  removeItem: (variantId: string) => void;
  updateQuantity: (variantId: string, qty: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextProps | undefined>(undefined);

export function CartProvider({ children }: PropsWithChildren) {
  const [cart, setCart] = useState<Cart>({ items: [], total: 0 });

  function recalcTotal(items: CartItem[]) {
    return items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  }

  const addItem = (item: CartItem) => {
    setCart((prev) => {
      const exists = prev.items.find((i) => i.variantId === item.variantId);
      let items;
      if (exists) {
        items = prev.items.map((i) =>
          i.variantId === item.variantId ? { ...i, quantity: i.quantity + item.quantity } : i
        );
      } else {
        items = [...prev.items, item];
      }
      return { items, total: recalcTotal(items) };
    });
  };

  const removeItem = (variantId: string) => {
    setCart((prev) => {
      const items = prev.items.filter((i) => i.variantId !== variantId);
      return { items, total: recalcTotal(items) };
    });
  };

  const updateQuantity = (variantId: string, qty: number) => {
    setCart((prev) => {
      const items = prev.items.map((i) =>
        i.variantId === variantId ? { ...i, quantity: qty } : i
      );
      return { items, total: recalcTotal(items) };
    });
  };

  const clearCart = () => setCart({ items: [], total: 0 });

  return (
    <CartContext.Provider value={{ cart, addItem, removeItem, updateQuantity, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
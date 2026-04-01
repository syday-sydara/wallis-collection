"use client";

import React, { createContext, useContext, useState, useEffect, PropsWithChildren } from "react";
import { Cart, CartItem } from "./types";

interface CartContextProps {
  cart: Cart;
  addItem: (item: CartItem) => void;
  removeItem: (variantId: string) => void;
  updateQuantity: (variantId: string, qty: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextProps | undefined>(undefined);

function recalcTotal(items: CartItem[]) {
  return items.reduce((sum, i) => sum + i.price * i.quantity, 0);
}

export function CartProvider({ children }: PropsWithChildren) {
  const [cart, setCart] = useState<Cart>({ items: [], total: 0 });

  const addItem = (item: CartItem) => {
    setCart(prev => {
      const existing = prev.items.find(i => i.variantId === item.variantId);

      if (existing) {
        const newQty = Math.min(existing.quantity + item.quantity, item.stock);
        if (newQty === existing.quantity) return prev;

        const items = prev.items.map(i =>
          i.variantId === item.variantId ? { ...i, quantity: newQty } : i
        );

        return { items, total: recalcTotal(items) };
      }

      const items = [...prev.items, { ...item, quantity: Math.min(item.quantity, item.stock) }];
      return { items, total: recalcTotal(items) };
    });
  };

  const removeItem = (variantId: string) => {
    setCart(prev => {
      const items = prev.items.filter(i => i.variantId !== variantId);
      return { items, total: recalcTotal(items) };
    });
  };

  const updateQuantity = (variantId: string, qty: number) => {
    setCart(prev => {
      const item = prev.items.find(i => i.variantId === variantId);
      if (!item) return prev;

      const newQty = Math.max(1, Math.min(qty, item.stock));
      if (newQty === item.quantity) return prev;

      const items = prev.items.map(i =>
        i.variantId === variantId ? { ...i, quantity: newQty } : i
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

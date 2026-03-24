"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { CartItem } from "@/lib/types/types";

// ... (keep your existing interfaces)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  // 1. Initial Load & Hydration
  useEffect(() => {
    const stored = localStorage.getItem("cart");
    if (stored) setItems(JSON.parse(stored));
    setIsHydrated(true);
  }, []);

  // 2. Save to LocalStorage
  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem("cart", JSON.stringify(items));
    }
  }, [items, isHydrated]);

  // 3. NEW: Cross-tab synchronization
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "cart" && e.newValue) {
        setItems(JSON.parse(e.newValue));
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // ... (keep your addItem, increment, decrement logic)
  
  // Prevent hydration mismatch by returning null or empty values until mounted
  if (!isHydrated) return null; 

  return (
    <CartContext.Provider value={{ /* ... values */ }}>
      {children}
    </CartContext.Provider>
  );
}
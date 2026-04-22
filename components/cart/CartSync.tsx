"use client";

import { useEffect } from "react";
import { useCart } from "@/lib/cart/store";

export function CartSync() {
  const { loadFromServer, syncToServer, items, isSynced } = useCart();

  // Load cart from server on mount (when user is logged in)
  useEffect(() => {
    loadFromServer();
  }, [loadFromServer]);

  // Sync cart to server when items change and not already synced
  useEffect(() => {
    if (items.length > 0 && !isSynced) {
      const timeoutId = setTimeout(() => {
        syncToServer();
      }, 2000); // Debounce sync

      return () => clearTimeout(timeoutId);
    }
  }, [items, isSynced, syncToServer]);

  return null; // This component doesn't render anything
}
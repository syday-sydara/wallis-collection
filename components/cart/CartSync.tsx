"use client";

import { useEffect, useRef } from "react";
import { useCart } from "@/lib/cart/store";

export function CartSync() {
  const { loadFromServer, syncToServer, items, isSynced } = useCart();

  // Prevent syncing immediately after loading from server
  const hasLoaded = useRef(false);

  // Load cart on mount
  useEffect(() => {
    loadFromServer().finally(() => {
      hasLoaded.current = true;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync cart when items change
  useEffect(() => {
    if (!hasLoaded.current) return; // Skip first load
    if (isSynced) return; // Already synced

    const timeoutId = setTimeout(() => {
      syncToServer();
    }, 2000);

    return () => clearTimeout(timeoutId);
  }, [items, isSynced, syncToServer]);

  return null;
}

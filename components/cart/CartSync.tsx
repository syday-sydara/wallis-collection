"use client";

import { useEffect, useRef } from "react";
import { useCart } from "@/lib/cart/store";

export function CartSync() {
  const { loadFromServer, syncToServer, items, isSynced } = useCart();

  // Prevent syncing immediately after initial load
  const hasLoaded = useRef(false);

  // Prevent multiple syncs running at once
  const isSyncing = useRef(false);

  // Debounce timer
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  /* ---------------------------------------------
   * Load cart on mount
   * --------------------------------------------- */
  useEffect(() => {
    loadFromServer()
      .catch(() => {
        // Optional: handle load failure (fallback to local cart)
      })
      .finally(() => {
        hasLoaded.current = true;
      });
  }, [loadFromServer]);

  /* ---------------------------------------------
   * Sync cart when items change (debounced)
   * --------------------------------------------- */
  useEffect(() => {
    if (!hasLoaded.current) return; // Skip initial load
    if (isSynced) return; // No changes to sync

    // Clear previous debounce
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(async () => {
      if (isSyncing.current) return;

      isSyncing.current = true;

      try {
        await syncToServer();
      } catch (err) {
        console.error("Cart sync failed:", err);
        // Optional: retry logic or mark as unsynced
      } finally {
        isSyncing.current = false;
      }
    }, 800); // Faster, more responsive sync

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [items, isSynced, syncToServer]);

  /* ---------------------------------------------
   * Multi‑tab sync (listen for storage events)
   * --------------------------------------------- */
  useEffect(() => {
    function handleStorage(e: StorageEvent) {
      if (e.key === "cart-updated") {
        loadFromServer();
      }
    }

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [loadFromServer]);

  return null;
}

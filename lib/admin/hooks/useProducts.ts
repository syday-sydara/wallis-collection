// lib/admin/hooks/useProducts.ts
"use client";

import { useEffect, useState } from "react";
import admin from "../client";

export function useProducts() {
  const [items, setItems] = useState([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadMore() {
    if (loading) return;
    setLoading(true);

    try {
      const data = await admin.products.list(nextCursor || undefined);
      setItems((prev) => [...prev, ...data.items]);
      setNextCursor(data.nextCursor || null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMore();
  }, []);

  return {
    items,
    loading,
    error,
    hasMore: Boolean(nextCursor),
    loadMore,
  };
}

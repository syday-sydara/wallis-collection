// lib/admin/hooks/useProduct.ts
"use client";

import { useEffect, useState } from "react";
import admin from "../client";

export function useProduct(productId: string) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    setLoading(true);
    try {
      const product = await admin.products.get(productId);
      setData(product);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, [productId]);

  return { data, loading, error, refresh };
}

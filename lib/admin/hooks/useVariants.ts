// lib/admin/hooks/useVariants.ts
"use client";

import { useState } from "react";
import admin from "../client";

export function useVariants(productId: string, initial = []) {
  const [items, setItems] = useState(initial);
  const [error, setError] = useState<string | null>(null);

  async function create(data) {
    try {
      const variant = await admin.variants.create(productId, data);
      setItems((prev) => [...prev, variant]);
      return variant;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }

  async function update(variantId: string, data) {
    try {
      const updated = await admin.variants.update(productId, variantId, data);
      setItems((prev) =>
        prev.map((v) => (v.id === variantId ? updated : v))
      );
      return updated;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }

  async function remove(variantId: string) {
    const old = items;
    setItems((prev) => prev.filter((v) => v.id !== variantId)); // optimistic

    try {
      await admin.variants.delete(productId, variantId);
    } catch (err: any) {
      setItems(old); // rollback
      setError(err.message);
      throw err;
    }
  }

  return { items, create, update, remove, error };
}

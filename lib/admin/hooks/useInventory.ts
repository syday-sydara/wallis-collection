// lib/admin/hooks/useInventory.ts
"use client";

import { useState } from "react";
import admin from "../client";

export function useInventory(productId: string) {
  const [error, setError] = useState<string | null>(null);

  async function updateProductStock(stock: number) {
    try {
      return await admin.inventory.updateProductStock(productId, stock);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }

  async function updateVariantStock(variantId: string, stock: number) {
    try {
      return await admin.inventory.updateVariantStock(
        productId,
        variantId,
        stock
      );
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }

  return { updateProductStock, updateVariantStock, error };
}

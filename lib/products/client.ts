"use client";

import type { ProductListParams, ProductListResult } from "@/lib/products/types";

export async function fetchProductsClient(
  params: ProductListParams = {}
): Promise<ProductListResult> {
  const query = new URLSearchParams(
    Object.entries(params)
      .filter(([_, v]) => v !== undefined && v !== null)
      .map(([k, v]) => [k, String(v)])
  );

  const res = await fetch(`/api/products?${query.toString()}`, {
    method: "GET",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "No body");
    throw new Error(`API error: ${res.status} ${res.statusText} — ${text}`);
  }

  return res.json();
}

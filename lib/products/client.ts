"use client";

import type { ProductListParams, ProductListResult } from "@/lib/products/types";

export async function fetchProductsClient(
  params: ProductListParams = {}
): Promise<ProductListResult> {
  const query = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) continue;

    if (Array.isArray(value)) {
      value.forEach(v => query.append(key, String(v)));
    } else {
      query.set(key, String(value));
    }
  }

  const res = await fetch(`/api/products?${query.toString()}`, {
    method: "GET",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "No body");
    throw new Error(`API error: ${res.status} ${res.statusText} — ${text}`);
  }

  return res.json();
}

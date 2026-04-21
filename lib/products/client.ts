"use client";

import type { ProductListParams, ProductListResult } from "@/lib/products/types";

export async function fetchProductsClient(
  params: ProductListParams = {}
): Promise<ProductListResult> {
  const query = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) continue;

    // Normalize cursor: empty string → skip
    if (key === "cursor" && value === "") continue;

    if (Array.isArray(value)) {
      for (const v of value) {
        if (v !== undefined && v !== null) {
          query.append(key, String(v));
        }
      }
    } else {
      query.set(key, String(value));
    }
  }

  const qs = query.toString();
  const url = qs ? `/api/products?${qs}` : `/api/products`;

  const res = await fetch(url, {
    method: "GET",
    cache: "no-store",
    next: { revalidate: 0 },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "No body");
    throw new Error(`API error: ${res.status} ${res.statusText} — ${text}`);
  }

  return res.json();
}

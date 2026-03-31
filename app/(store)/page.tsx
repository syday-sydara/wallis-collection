"use client";

import { useState } from "react";
import ProductList from "@/components/products/ProductList";
import { ProductListParams } from "@/lib/catalog/types";

export default function StorePage() {
  const [search, setSearch] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [includeArchived, setIncludeArchived] = useState(false);

  const params: ProductListParams = {
    search: search || undefined,
    minPrice: minPrice ? parseInt(minPrice) * 100 : undefined,
    maxPrice: maxPrice ? parseInt(maxPrice) * 100 : undefined,
    includeArchived,
    limit: 24,
  };

  return (
    <main className="mx-auto max-w-6xl px-4 py-6">
      {/* =========================
           FILTERS
      ========================= */}
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-md border border-border p-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Min (₦)"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="w-1/2 rounded-md border border-border p-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <input
            type="number"
            placeholder="Max (₦)"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="w-1/2 rounded-md border border-border p-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <label className="flex items-center gap-2 text-sm text-text">
          <input
            type="checkbox"
            checked={includeArchived}
            onChange={(e) => setIncludeArchived(e.target.checked)}
            className="h-4 w-4 rounded border-border text-primary focus:ring-2 focus:ring-primary"
          />
          Include archived
        </label>
      </div>

      {/* =========================
           PRODUCT LIST
      ========================= */}
      <ProductList params={params} />
    </main>
  );
}
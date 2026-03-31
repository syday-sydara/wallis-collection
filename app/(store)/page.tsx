"use client";

import { useEffect, useState } from "react";
import ProductList from "@/components/products/ProductList";
import { ProductListParams } from "@/lib/catalog/types";

export default function StorePage() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [includeArchived, setIncludeArchived] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  // Debounce search
  useEffect(() => {
    setIsTyping(true);
    const t = setTimeout(() => {
      setDebouncedSearch(search);
      setIsTyping(false);
    }, 400);

    return () => clearTimeout(t);
  }, [search]);

  const parsedMin = Number(minPrice);
  const parsedMax = Number(maxPrice);

  const params: ProductListParams = {
    search: debouncedSearch || undefined,
    minPrice: !isNaN(parsedMin) ? parsedMin * 100 : undefined,
    maxPrice: !isNaN(parsedMax) ? parsedMax * 100 : undefined,
    includeArchived,
    limit: 24,
  };

  return (
    <main className="mx-auto max-w-6xl px-4 py-6">
      {/* FILTERS */}
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input text-sm"
        />

        <div className="flex gap-2">
          <input
            type="number"
            inputMode="numeric"
            placeholder="Min (₦)"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="input text-sm w-1/2"
          />
          <input
            type="number"
            inputMode="numeric"
            placeholder="Max (₦)"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="input text-sm w-1/2"
          />
        </div>

        {process.env.NODE_ENV !== "production" && (
          <label className="flex items-center gap-2 text-sm text-text">
            <input
              type="checkbox"
              checked={includeArchived}
              onChange={(e) => setIncludeArchived(e.target.checked)}
              className="h-4 w-4 rounded border-border text-primary focus:ring-2 focus:ring-primary"
            />
            Include archived
          </label>
        )}
      </div>

      {isTyping && (
        <p className="mb-2 text-xs text-text-muted">Searching...</p>
      )}

      <ProductList params={params} />
    </main>
  );
}
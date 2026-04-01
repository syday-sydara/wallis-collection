"use client";

import { useState, useMemo } from "react";
import ProductList from "@/components/products/ProductList";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import type { ProductListParams } from "@/lib/catalog/types";

export default function StorePage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string | undefined>();

  const params: ProductListParams = useMemo(() => {
    const p: ProductListParams = {};
    if (search) p.search = search;
    if (category) p.category = category;
    return p;
  }, [search, category]);

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 space-y-6 animate-fadeIn">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 leading-none">
        <h1 className="text-2xl font-semibold tracking-tight text-text">
          Shop Products
        </h1>

        <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full md:w-auto">
          <Input
            aria-label="Search products"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1"
          />

          <Button
            onClick={() => console.log("Apply filters")}
            className="w-full sm:w-auto min-h-touch active:scale-press"
          >
            Search
          </Button>
        </div>
      </header>

      <div className="border-b border-border-subtle" />

      {/* Product List */}
      <ProductList params={params} />
    </main>
  );
}

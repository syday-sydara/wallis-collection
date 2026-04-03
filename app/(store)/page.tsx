"use client";

import { useState, useMemo } from "react";
import ProductList from "@/components/products/ProductList";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const CATEGORIES = [
  { id: "all", label: "All" },
  { id: "bags", label: "Bags" },
  { id: "shoes", label: "Shoes" },
  { id: "accessories", label: "Accessories" },
];

const SORT_OPTIONS = [
  { id: "newest", label: "Newest" },
  { id: "price-asc", label: "Price: Low to High" },
  { id: "price-desc", label: "Price: High to Low" },
  { id: "popular", label: "Most Popular" },
];

export default function StorePage() {
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState("newest");

  const params = useMemo(() => {
    const p: any = {};
    if (category !== "all") p.category = category;
    if (sort) p.sort = sort;
    return p;
  }, [category, sort]);

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 space-y-6 animate-fadeIn">
      {/* Header */}
      <header className="space-y-4">
        <h1 className="text-2xl font-semibold tracking-tight text-text">
          Shop Products
        </h1>

        {/* Category Filters */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {CATEGORIES.map((c) => (
            <Button
              key={c.id}
              variant={category === c.id ? "default" : "outline"}
              onClick={() => setCategory(c.id)}
              className={cn(
                "whitespace-nowrap min-h-touch",
                category === c.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-surface text-text hover:bg-surface-muted"
              )}
            >
              {c.label}
            </Button>
          ))}
        </div>

        {/* Sorting */}
        <div className="flex justify-end">
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="border border-border-subtle rounded-md px-3 py-2 bg-surface text-text"
          >
            {SORT_OPTIONS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </header>

      <div className="border-b border-border-subtle" />

      {/* Product List */}
      <ProductList params={params} />
    </main>
  );
}
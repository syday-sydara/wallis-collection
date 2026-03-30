// app/store/page.tsx
"use client";

import { useState, useEffect, Suspense } from "react";
import { formatCurrency } from "@/lib/utils/formatters/currency";
import { cn } from "@/lib/utils/";
import { ProductWithRelations, ProductListParams } from "@/lib/catalog/types";
import { listProducts } from "@/lib/catalog/listProducts";

import ProductGrid from "@/components/products/ProductGrid";
import ProductGridSkeleton from "@/components/products/ProductGridSkeleton";
import ResultHeader from "@/components/products/ResultHeader";
import EmptyState from "@/components/ui/EmptyState";

// --- Form controls ---
function SearchBar({
  search,
  setSearch,
}: {
  search: string;
  setSearch: (s: string) => void;
}) {
  return (
    <input
      type="text"
      placeholder="Search products..."
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      className="w-full rounded-md border border-border p-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
    />
  );
}

function PriceFilter({
  minPrice,
  maxPrice,
  setMinPrice,
  setMaxPrice,
}: {
  minPrice: string;
  maxPrice: string;
  setMinPrice: (v: string) => void;
  setMaxPrice: (v: string) => void;
}) {
  return (
    <div className="flex gap-2">
      <input
        type="number"
        placeholder="Min (₦)"
        value={minPrice}
        onChange={(e) => setMinPrice(e.target.value)}
        className="w-1/2 rounded-md border border-border p-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
      />
      <input
        type="number"
        placeholder="Max (₦)"
        value={maxPrice}
        onChange={(e) => setMaxPrice(e.target.value)}
        className="w-1/2 rounded-md border border-border p-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
      />
    </div>
  );
}

function IncludeArchivedToggle({
  includeArchived,
  setIncludeArchived,
}: {
  includeArchived: boolean;
  setIncludeArchived: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2 text-sm">
      <input
        type="checkbox"
        checked={includeArchived}
        onChange={(e) => setIncludeArchived(e.target.checked)}
        className="h-4 w-4 rounded border-border text-primary focus:ring-2 focus:ring-primary"
      />
      Include archived
    </label>
  );
}

// --- Main StorePage ---
export default function StorePage() {
  const [search, setSearch] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [includeArchived, setIncludeArchived] = useState(false);
  const [products, setProducts] = useState<ProductWithRelations[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async (cursor?: string) => {
    setLoading(true);
    setError(null);

    const params: ProductListParams = {
      search: search || undefined,
      minPrice: minPrice ? parseInt(minPrice) * 100 : undefined, // naira -> kobo
      maxPrice: maxPrice ? parseInt(maxPrice) * 100 : undefined,
      includeArchived,
      limit: 24,
      cursor,
    };

    try {
      const result = await listProducts(params);
      if (cursor) {
        setProducts((prev) => [...prev, ...result.items]);
      } else {
        setProducts(result.items);
      }
      setNextCursor(result.nextCursor);
    } catch (err) {
      console.error("listProducts failed", err);
      setError("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  // fetch on filter change
  useEffect(() => {
    fetchProducts();
  }, [search, minPrice, maxPrice, includeArchived]);

  return (
    <main className="mx-auto max-w-6xl px-4 py-6">
      {/* Filters */}
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <SearchBar search={search} setSearch={setSearch} />
        <PriceFilter
          minPrice={minPrice}
          maxPrice={maxPrice}
          setMinPrice={setMinPrice}
          setMaxPrice={setMaxPrice}
        />
        <IncludeArchivedToggle
          includeArchived={includeArchived}
          setIncludeArchived={setIncludeArchived}
        />
      </div>

      {error && (
        <div className="mb-4 text-center text-danger">{error}</div>
      )}

      {loading && !products.length ? (
        <ProductGridSkeleton />
      ) : products.length === 0 ? (
        <EmptyState
          title="No products found"
          description="Try changing your search or price filters."
        />
      ) : (
        <>
          <ResultHeader count={products.length} />
          <ProductGrid products={products} />

          {nextCursor && (
            <div className="mt-6 flex justify-center">
              <button
                onClick={() => fetchProducts(nextCursor!)}
                className={cn(
                  "rounded-md bg-primary px-4 py-2 text-white hover:bg-primary-hover",
                  loading ? "opacity-50 pointer-events-none" : ""
                )}
              >
                {loading ? "Loading..." : "Load more"}
              </button>
            </div>
          )}
        </>
      )}
    </main>
  );
}
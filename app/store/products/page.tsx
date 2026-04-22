"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import ProductGrid from "@/components/products/ProductGrid";
import ProductGridSkeleton from "@/components/products/ProductGridSkeleton";
import EmptyState from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import type {
  ProductListParams,
  ProductListResult,
  ProductCardVM,
} from "@/lib/products/types";

function debounce<T extends (...args: any[]) => any>(fn: T, delay: number) {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), delay);
  };
}

export default function ProductsPage() {
  const [products, setProducts] = useState<ProductCardVM[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(false);

  const loadMoreRef = useRef<HTMLDivElement>(null);
  const requestIdRef = useRef(0);

  const params = useMemo<ProductListParams>(() => ({}), []);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // Fetch wrapper
  async function fetchFromApi(p: ProductListParams): Promise<ProductListResult> {
    const query = new URLSearchParams(
      Object.entries(p)
        .filter(([_, v]) => v !== undefined && v !== null)
        .map(([k, v]) => [k, String(v)])
    );

    const res = await fetch(`/api/products?${query.toString()}`);
    if (!res.ok) throw new Error("API error");
    return res.json();
  }

  // Initial fetch
  useEffect(() => {
    const requestId = ++requestIdRef.current;

    setLoading(true);
    setError(false);

    async function fetchProducts() {
      try {
        const res = await fetchFromApi(params);

        if (requestId !== requestIdRef.current) return;

        setProducts(res.items);
        setNextCursor(res.nextCursor);
      } catch {
        if (requestId === requestIdRef.current) setError(true);
      } finally {
        if (requestId === requestIdRef.current) setLoading(false);
      }
    }

    fetchProducts();
  }, [params]);

  // Load more (debounced)
  const loadMore = useCallback(
    debounce(async () => {
      if (!nextCursor || loadingMore) return;

      setLoadingMore(true);
      const currentCursor = nextCursor;

      try {
        const res = await fetchFromApi({
          ...params,
          cursor: currentCursor,
        });

        if (currentCursor !== nextCursor) return;

        setProducts((prev) => [...prev, ...res.items]);
        setNextCursor(res.nextCursor);
      } catch {
        console.error("Failed to load more products");
      } finally {
        setLoadingMore(false);
      }
    }, 150),
    [nextCursor, loadingMore, params]
  );

  // Infinite scroll observer
  useEffect(() => {
    if (!loadMoreRef.current || !nextCursor) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore();
      },
      { rootMargin: "200px" }
    );

    observer.observe(loadMoreRef.current);

    return () => {
      if (loadMoreRef.current) observer.unobserve(loadMoreRef.current);
      observer.disconnect();
    };
  }, [loadMore, nextCursor]);

  // UI states
  if (loading) return <ProductGridSkeleton />;

  if (error)
    return (
      <EmptyState
        title="Error loading products"
        description="Check your connection and try again."
        action={<Button onClick={() => location.reload()}>Retry</Button>}
      />
    );

  if (!products.length)
    return <EmptyState description="No products available at the moment." />;

  return (
    <div className="px-4 py-8 max-w-7xl mx-auto space-y-8">
      <ProductGrid products={products} />

      {nextCursor && (
        <div
          ref={loadMoreRef}
          className="text-center text-sm text-text-muted pb-safe"
        >
          {loadingMore ? "Loading more products..." : "Scroll down to load more"}
        </div>
      )}

      {/* Fallback button */}
      {nextCursor && !loadingMore && (
        <Button onClick={loadMore} variant="outline" className="mx-auto block">
          Load More
        </Button>
      )}

      {!nextCursor && (
        <p className="text-center text-xs text-text-muted animate-fadeIn">
          No more products
        </p>
      )}
    </div>
  );
}

"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import ProductGrid from "@/components/products/ProductGrid";
import ProductGridSkeleton from "@/components/products/ProductGridSkeleton";
import EmptyState from "@/components/products/EmptyState";
import { Button } from "@/components/ui/Button";
import { listProducts } from "@/lib/catalog/listProducts";
import type { ProductListParams, ProductListResult, ProductWithRelations } from "@/lib/catalog/types";

export default function ProductsPage() {
  const [products, setProducts] = useState<ProductWithRelations[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(false);

  const loadMoreRef = useRef<HTMLDivElement>(null);
  const requestIdRef = useRef(0);

  const params: ProductListParams = {}; // Customize filters as needed

  // Initial fetch
  useEffect(() => {
    const requestId = ++requestIdRef.current;

    setLoading(true);
    setError(false);

    async function fetchProducts() {
      try {
        const res: ProductListResult = await listProducts(params);

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

  // Load more
  const loadMore = useCallback(async () => {
    if (!nextCursor || loadingMore) return;

    setLoadingMore(true);
    const currentCursor = nextCursor;

    try {
      const res: ProductListResult = await listProducts({
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
  }, [nextCursor, loadingMore, params]);

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

  if (loading) return <ProductGridSkeleton />;

  if (error)
    return (
      <EmptyState
        title="Error loading products"
        description="Check your connection and try again."
        action={
          <Button onClick={() => location.reload()}>Retry</Button>
        }
      />
    );

  if (!products.length)
    return <EmptyState description="No products available at the moment." />;

  return (
    <div className="px-4 py-8 max-w-7xl mx-auto space-y-8">
      <ProductGrid products={products} />

      {nextCursor && (
        <div ref={loadMoreRef} className="text-center text-sm text-text-muted">
          {loadingMore ? "Loading more products..." : "Scroll down to load more"}
        </div>
      )}

      {!nextCursor && (
        <p className="text-center text-xs text-text-muted">
          No more products
        </p>
      )}
    </div>
  );
}
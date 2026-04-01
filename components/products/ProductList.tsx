"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import ProductGrid from "./ProductGrid";
import ProductGridSkeleton from "./ProductGridSkeleton";
import EmptyState from "@/components/products/EmptyState";
import ErrorState from "./ErrorState";
import ResultHeader from "./ResultHeader";
import { listProducts } from "@/lib/catalog/listProducts";
import type {
  ProductListParams,
  ProductListResult,
  ProductWithRelations,
} from "@/lib/catalog/types";

type ProductListProps = {
  params: ProductListParams;
};

export default function ProductList({ params }: ProductListProps) {
  const [products, setProducts] = useState<ProductWithRelations[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(false);

  const loadMoreRef = useRef<HTMLDivElement>(null);
  const requestIdRef = useRef(0);

  // Initial fetch
  useEffect(() => {
    const requestId = ++requestIdRef.current;

    setLoading(products.length === 0);
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

  // IntersectionObserver for infinite scroll
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
      <ErrorState
        title="Error loading products"
        description="Check your connection and try again."
        action={
          <button
            onClick={() => location.reload()}
            className="btn btn-primary mt-2"
          >
            Retry
          </button>
        }
      />
    );

  if (!products.length)
    return <EmptyState title="No products found" />;

  return (
    <>
      <ResultHeader count={products.length} />
      <ProductGrid products={products} />

      {nextCursor && (
        <div
          ref={loadMoreRef}
          className="mt-4 text-center text-sm text-text-subtle"
        >
          {loadingMore ? "Loading more products..." : "Scroll down to load more"}
        </div>
      )}

      {!nextCursor && (
        <p className="mt-4 text-center text-xs text-text-subtle">
          No more products
        </p>
      )}
    </>
  );
}
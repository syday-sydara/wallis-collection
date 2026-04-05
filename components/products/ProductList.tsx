"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import ProductGrid from "./ProductGrid";
import ProductGridSkeleton from "./ProductGridSkeleton";
import EmptyState from "@/components/products/EmptyState";
import ErrorState from "./ErrorState";
import ResultHeader from "./ResultHeader";
import { getProducts } from "@/lib/products/service";

import type {
  ProductListParams,
  ProductListResult,
  ProductCardVM,
} from "@/lib/products/types";

type ProductListProps = {
  params: ProductListParams;
};

export default function ProductList({ params }: ProductListProps) {
  const [products, setProducts] = useState<ProductCardVM[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(false);

  const loadMoreRef = useRef<HTMLDivElement>(null);
  const requestIdRef = useRef(0);
  const nextCursorRef = useRef<string | null>(null);

  // Keep nextCursorRef in sync
  useEffect(() => {
    nextCursorRef.current = nextCursor;
  }, [nextCursor]);

  // Initial fetch (with proper reset + unmount safety)
  useEffect(() => {
    const requestId = ++requestIdRef.current;
    let isMounted = true;

    setLoading(true);
    setError(false);

    async function fetchProducts() {
      try {
        const res: ProductListResult = await listProducts(params);

        if (!isMounted || requestId !== requestIdRef.current) return;

        setProducts(res.items);
        setNextCursor(res.nextCursor);
      } catch {
        if (isMounted && requestId === requestIdRef.current) {
          setError(true);
        }
      } finally {
        if (isMounted && requestId === requestIdRef.current) {
          setLoading(false);
        }
      }
    }

    fetchProducts();

    return () => {
      isMounted = false;
    };
  }, [params]);

  // Load more (with stable cursor check)
  const loadMore = useCallback(async () => {
    if (!nextCursorRef.current || loadingMore) return;

    setLoadingMore(true);
    const currentCursor = nextCursorRef.current;

    try {
      const res: ProductListResult = await listProducts({
        ...params,
        cursor: currentCursor,
      });

      // Prevent race conditions
      if (currentCursor !== nextCursorRef.current) return;

      setProducts((prev) => [...prev, ...res.items]);
      setNextCursor(res.nextCursor);
    } catch {
      console.error("Failed to load more products");
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, params]);

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

  if (!products.length) return <EmptyState title="No products found" />;

  return (
    <>
      <ResultHeader count={products.length} />

      <div className="animate-fadeIn">
        <ProductGrid products={products} />
      </div>

      {nextCursor && (
        <div
          ref={loadMoreRef}
          aria-busy={loadingMore}
          className="mt-4 text-center text-sm text-text-muted leading-none pb-safe"
        >
          {loadingMore ? "Loading more products..." : "Scroll down to load more"}
        </div>
      )}

      {!nextCursor && (
        <p className="mt-4 text-center text-xs text-text-muted animate-fadeIn-fast">
          No more products
        </p>
      )}
    </>
  );
}
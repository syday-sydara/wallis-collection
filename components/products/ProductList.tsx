"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import ProductGrid from "./ProductGrid";
import ProductGridSkeleton from "./ProductGridSkeleton";
import EmptyState from "@/components/ui/EmptyState";
import ErrorState from "../ui/ErrorState";
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

  // Initial fetch
  useEffect(() => {
    const requestId = ++requestIdRef.current;
    let isMounted = true;

    setLoading(true);
    setError(false);

    async function fetchProducts() {
      try {
        const res: ProductListResult = await getProducts(params);

        if (!isMounted || requestId !== requestIdRef.current) return;

        setProducts(res.items);
        setNextCursor(res.nextCursor);
      } catch (err) {
        if (isMounted && requestId === requestIdRef.current) {
          console.error("Error fetching products:", err);
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

  // Load more function
  const loadMore = useCallback(async () => {
    if (!nextCursorRef.current || loadingMore) return;

    setLoadingMore(true);
    const currentCursor = nextCursorRef.current;

    try {
      const res: ProductListResult = await getProducts({
        ...params,
        cursor: currentCursor,
      });

      if (currentCursor !== nextCursorRef.current) return;

      setProducts((prev) => [...prev, ...res.items]);
      setNextCursor(res.nextCursor);
    } catch (err) {
      console.error("Failed to load more products:", err);
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

    const el = loadMoreRef.current;
    observer.observe(el);

    return () => {
      observer.unobserve(el);
      observer.disconnect();
    };
  }, [loadMore, nextCursor]);

  // UI states
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
      {/* Result Header */}
      <ResultHeader count={products.length} />

      {/* Product Grid */}
      <div className="animate-fadeIn">
        <ProductGrid products={products} />
      </div>

      {/* Infinite Scroll / Load More */}
      {nextCursor && (
        <div
          ref={loadMoreRef}
          role="status"
          aria-busy={loadingMore}
          className="mt-4 text-center text-sm text-text-muted leading-none pb-safe"
        >
          {loadingMore ? "Loading more products..." : "Scroll down to load more"}
        </div>
      )}

      {/* End of list message */}
      {!nextCursor && products.length > 0 && (
        <p className="mt-4 text-center text-xs text-text-muted animate-fadeIn-fast">
          No more products
        </p>
      )}
    </>
  );
}
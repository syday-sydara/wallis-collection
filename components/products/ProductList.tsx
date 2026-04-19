"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import ProductGrid from "./ProductGrid";
import ProductGridSkeleton from "./ProductGridSkeleton";
import EmptyState from "@/components/ui/EmptyState";
import ErrorState from "../ui/ErrorState";
import ResultHeader from "./ResultHeader";

import type {
  ProductListParams,
  ProductListResult,
  ProductCardVM,
} from "@/lib/products/types";

function useDebouncedCallback<T extends (...args: any[]) => any>(fn: T, delay: number) {
  const timeoutRef = useRef<NodeJS.Timeout>();

  return useCallback(
    (...args: Parameters<T>) => {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => fn(...args), delay);
    },
    [fn, delay]
  );
}

export default function ProductList({ params }: { params: ProductListParams }) {
  const [products, setProducts] = useState<ProductCardVM[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(false);

  const loadMoreRef = useRef<HTMLDivElement>(null);
  const requestIdRef = useRef(0);
  const nextCursorRef = useRef<string | null>(null);

  useEffect(() => {
    nextCursorRef.current = nextCursor;
  }, [nextCursor]);

  async function fetchFromApi(p: ProductListParams): Promise<ProductListResult> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    try {
      const query = new URLSearchParams(
        Object.entries(p)
          .filter(([_, v]) => v !== undefined && v !== null)
          .map(([k, v]) => [k, String(v)])
      );

      const res = await fetch(`/api/products?${query.toString()}`, {
        signal: controller.signal,
      });

      if (!res.ok) throw new Error("API error");
      return res.json();
    } finally {
      clearTimeout(timeout);
    }
  }

  // Reset scroll on filter change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [params]);

  // Initial load
  useEffect(() => {
    const requestId = ++requestIdRef.current;
    let isMounted = true;

    setLoading(true);
    setError(false);

    async function load() {
      try {
        const res = await fetchFromApi(params);

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

    load();
    return () => {
      isMounted = false;
    };
  }, [params]);

  const loadMore = useDebouncedCallback(async () => {
    if (!nextCursorRef.current || loadingMore) return;

    setLoadingMore(true);
    const currentCursor = nextCursorRef.current;

    try {
      const res = await fetchFromApi({
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
  }, 150);

  // Infinite scroll observer
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

  /* ---------------- UI ---------------- */

  if (loading) return <ProductGridSkeleton />;

  if (error)
    return (
      <ErrorState
        title="Error loading products"
        description="Check your connection and try again."
        action={
          <button onClick={() => location.reload()} className="btn btn-primary mt-2">
            Retry
          </button>
        }
      />
    );

  if (!products.length)
    return (
      <div className="animate-fadeIn">
        <EmptyState
          title="No products found"
          description="Try adjusting your filters."
        />
      </div>
    );

  return (
    <>
      <ResultHeader count={products.length} />

      <div className="animate-fadeIn duration-300">
        <ProductGrid products={products} />
      </div>

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

      {/* Load More button fallback */}
      {nextCursor && !loadingMore && (
        <button onClick={loadMore} className="btn btn-outline mt-4 mx-auto block">
          Load More
        </button>
      )}

      {!nextCursor && products.length > 0 && (
        <p className="mt-4 text-center text-xs text-text-muted opacity-80 animate-fadeIn">
          No more products
        </p>
      )}
    </>
  );
}

"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import ProductGrid from "@/components/products/ProductGrid";
import Loading from "@/components/products/Loading";
import { Product } from "@/components/products/ProductGrid";

/**
 * Custom hook for infinite scrolling products
 */
function useInfiniteProducts(initial: Product[]) {
  const [products, setProducts] = useState<Product[]>(initial);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const fetchMore = useCallback(async () => {
    if (loadingMore || !hasMore) return; // prevent duplicate fetch
    setLoadingMore(true);

    try {
      const res = await fetch(`/api/products?page=${page + 1}`);
      if (!res.ok) throw new Error("Failed to fetch products");

      const newProducts: Product[] = await res.json();
      if (newProducts.length === 0) {
        setHasMore(false);
      } else {
        setProducts((prev) => [...prev, ...newProducts]);
        setPage((prev) => prev + 1);
      }
    } catch (err) {
      console.error("Error loading more products:", err);
    } finally {
      setLoadingMore(false);
    }
  }, [page, loadingMore, hasMore]);

  return { products, fetchMore, loadingMore, hasMore };
}

/**
 * IntersectionObserver trigger component
 */
function InfiniteScrollTrigger({ onInView }: { onInView: () => void }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) onInView();
      },
      { rootMargin: "200px" } // prefetch before reaching bottom
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [onInView]);

  return <div ref={ref} className="h-8" />;
}

/**
 * Client-side product grid with infinite scroll
 */
export default function ClientProductGrid({
  initialProducts,
}: {
  initialProducts: Product[];
}) {
  const { products, fetchMore, loadingMore, hasMore } =
    useInfiniteProducts(initialProducts);

  return (
    <>
      <ProductGrid products={products} skeletonCount={8} loading={loadingMore} />

      {hasMore && <InfiniteScrollTrigger onInView={fetchMore} />}

      {loadingMore && (
        <div className="mt-4 flex justify-center">
          <Loading count={4} showSpinner message="Loading more products..." />
        </div>
      )}

      {!hasMore && products.length > 0 && (
        <p className="text-center text-sm text-gray-500 mt-6">
          You’ve reached the end of the catalog
        </p>
      )}
    </>
  );
}
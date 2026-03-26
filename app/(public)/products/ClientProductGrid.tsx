// File: ClientProductGrid.tsx
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import ProductGrid from "@/components/products/ProductGrid";
import Loading from "@/components/products/Loading";
import { Product } from "@/components/products/ProductGrid";

interface PaginatedResponse {
  data: Product[];
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
}

function useInfiniteProducts(initial: Product[]) {
  const [products, setProducts] = useState(initial);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true); // new flag

  const fetchMore = useCallback(async () => {
    if (loadingMore || !hasMore) return; // prevent unnecessary calls
    setLoadingMore(true);

    try {
      const res = await fetch(`/api/products?page=${page + 1}`);
      const json: PaginatedResponse = await res.json();

      if (json.data.length > 0) {
        setProducts((prev) => [...prev, ...json.data]);
        setPage(json.page);
        setHasMore(json.hasMore);
      } else {
        setHasMore(false);
      }
    } finally {
      setLoadingMore(false);
    }
  }, [page, loadingMore, hasMore]);

  return { products, fetchMore, loadingMore, hasMore };
}

function InfiniteScrollTrigger({ onInView }: { onInView: () => void }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) onInView();
    });

    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [onInView]);

  return <div ref={ref} className="h-8" />;
}

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
    </>
  );
}
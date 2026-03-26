"use client";

import { useState, useEffect, useRef } from "react";
import ProductGrid from "@/components/products/ProductGrid";
import Loading from "@/components/products/Loading";
import { Product } from "@/components/products/ProductGrid";

function useInfiniteProducts(initial: Product[]) {
  const [products, setProducts] = useState(initial);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchMore = async () => {
    setLoadingMore(true);
    try {
      const res = await fetch(`/api/products?page=${page + 1}`);
      const newProducts: Product[] = await res.json();
      if (newProducts.length > 0) {
        setProducts((prev) => [...prev, ...newProducts]);
        setPage((prev) => prev + 1);
      }
    } finally {
      setLoadingMore(false);
    }
  };

  return { products, fetchMore, loadingMore };
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
  const { products, fetchMore, loadingMore } =
    useInfiniteProducts(initialProducts);

  return (
    <>
      <ProductGrid products={products} skeletonCount={8} loading={loadingMore} />

      <InfiniteScrollTrigger onInView={fetchMore} />

      {loadingMore && (
        <div className="mt-4 flex justify-center">
          <Loading count={4} showSpinner message="Loading more products..." />
        </div>
      )}
    </>
  );
}
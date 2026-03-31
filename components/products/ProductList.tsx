"use client";

import { useEffect, useState } from "react";
import ProductGrid from "./ProductGrid";
import ProductGridSkeleton from "./ProductGridSkeleton";
import EmptyState from "../ui/EmptyState";
import ResultHeader from "./ResultHeader";
import Pagination from "../ui/Pagination";
import { listProducts } from "@/lib/catalog/service";
import type { ProductListParams, ProductListResult, ProductWithRelations } from "@/lib/catalog/types";

export default function ProductList({ params }: { params: ProductListParams }) {
  const [products, setProducts] = useState<ProductWithRelations[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    setError(false);

    async function fetchProducts() {
      try {
        const res: ProductListResult = await listProducts(params);
        if (cancelled) return;

        setProducts(res.items);
        setNextCursor(res.nextCursor);
      } catch {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchProducts();

    return () => {
      cancelled = true;
    };
  }, [params]);

  if (loading) return <ProductGridSkeleton />;

  if (error)
    return (
      <EmptyState
        title="Error loading products"
        description="Check your connection and try again."
      />
    );

  if (!products.length) return <EmptyState />;

  return (
    <>
      <ResultHeader count={products.length} />
      <ProductGrid products={products} />
      {nextCursor && (
        <Pagination cursor={nextCursor} limit={params.limit ?? 24} />
      )}
    </>
  );
}
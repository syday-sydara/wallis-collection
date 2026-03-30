"use client";

import { useState, useEffect } from "react";
import ProductGrid from "./ProductGrid";
import ProductGridSkeleton from "./ProductGridSkeleton";
import EmptyState from "../ui/EmptyState";
import ResultHeader from "./ResultHeader";
import Pagination from "../ui/Pagination";
import type { ProductListParams } from "@/lib/catalog/types";
import { listProducts } from "@/lib/catalog/products";

const toNumber = (v?: string) => {
  if (!v) return undefined;
  const n = Number.parseFloat(v);
  return Number.isFinite(n) ? n : undefined;
};

const clean = (obj: Record<string, any>) =>
  Object.fromEntries(
    Object.entries(obj).filter(
      ([_, v]) => v !== undefined && v !== null && v !== "" && !(typeof v === "number" && Number.isNaN(v))
    )
  );

export default function ProductList({ searchParams }: { searchParams: Record<string, any> }) {
  const [products, setProducts] = useState<any[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const params: ProductListParams = clean({
    search: searchParams?.search,
    minPrice: toNumber(searchParams?.minPrice),
    maxPrice: toNumber(searchParams?.maxPrice),
    includeArchived: searchParams?.includeArchived === "true",
    limit: toNumber(searchParams?.limit) ?? 24,
    cursor: searchParams?.cursor,
  });

  useEffect(() => {
    setLoading(true);
    setError(false);

    listProducts(params)
      .then((res) => {
        setProducts(res.items);
        setNextCursor(res.nextCursor);
      })
      .catch((err) => {
        console.error("listProducts failed", err);
        setError(true);
      })
      .finally(() => setLoading(false));
  }, [JSON.stringify(params)]);

  if (loading) return <ProductGridSkeleton />;
  if (error) return <EmptyState title="Error loading products" description="Please try again later." />;
  if (!products.length) return <EmptyState />;

  return (
    <>
      <ResultHeader count={products.length} />
      <ProductGrid products={products} />
      {nextCursor && <Pagination cursor={nextCursor} limit={params.limit ?? 24} />}
    </>
  );
}
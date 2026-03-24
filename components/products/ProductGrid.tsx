"use client";

import React from "react";
import Link from "next/link";
import ProductCard, { ProductCardProps } from "./ProductCard";
import Loading from "@/components/products/Loading";
import Skeleton from "@/components/ui/Skeleton";

export interface Product extends Omit<ProductCardProps, "onAddToCart"> {}

interface ProductGridProps {
  products?: Product[] | null;
  loading?: boolean;
  onAddToCart?: (product: Product) => void;
  emptyMessage?: string;
  skeletonCount?: number;
}

export default function ProductGrid({
  products,
  loading = false,
  onAddToCart,
  emptyMessage = "No products found.",
  skeletonCount = 8,
}: ProductGridProps) {
  const gridClasses =
    "grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5";

  // Loading placeholders
  if (loading) {
    return (
      <Loading
        count={skeletonCount}
        message="Loading products..."
        aria-live="polite"
      />
    );
  }

  // Skeleton fallback when products undefined
  if (!products) {
    return (
      <div
        className={gridClasses}
        role="list"
        aria-label="Loading product placeholders"
        aria-busy="true"
      >
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <div key={`skeleton-${i}`} role="presentation" className="space-y-2">
            <Skeleton className="w-full aspect-[3/4] rounded-lg" />
            <Skeleton className="w-3/4 h-4" />
            <Skeleton className="w-1/2 h-4" />
          </div>
        ))}
      </div>
    );
  }

  // No products state
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-[var(--color-text-secondary)]">
        <p className="text-center">{emptyMessage}</p>
        <Link
          href="/"
          className="mt-4 text-[var(--color-accent-500)] hover:underline"
        >
          Return to homepage
        </Link>
      </div>
    );
  }

  // Product grid
  return (
    <div className={gridClasses} role="list" aria-label="Product grid">
      {products.map((product) => (
        <div key={product.id} role="listitem">
          <ProductCard
            {...product}
            onAddToCart={() => onAddToCart?.(product)}
          />
        </div>
      ))}
    </div>
  );
}
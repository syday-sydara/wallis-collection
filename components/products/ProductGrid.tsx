"use client";

import React from "react";
import Link from "next/link";
import ProductCard, { type ProductCardProps } from "./ProductCard";
import Loading from "@/components/products/Loading";
import Skeleton from "@/components/ui/Skeleton";

export interface Product {
  id: string;
  name: string;
  slug: string;
  priceNaira: number;
  salePriceNaira?: number;
  images?: { url: string }[];
  isNew?: boolean;
  isOnSale?: boolean;
  stock?: number;
}

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
  const showSkeletons = products === undefined && !loading;
  const showEmpty = products && products.length === 0 && !loading;

  if (loading) {
    return <Loading count={skeletonCount} message="Loading products..." />;
  }

  if (showSkeletons) {
    return (
      <div
        className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
        role="list"
        aria-label="Loading product placeholders"
        aria-busy="true"
      >
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <div key={`skeleton-${i}`} role="listitem" aria-hidden="true" className="space-y-2">
            <Skeleton className="w-full aspect-[3/4] rounded-lg" />
            <Skeleton className="w-3/4 h-4" />
            <Skeleton className="w-1/2 h-4" />
          </div>
        ))}
      </div>
    );
  }

  if (showEmpty) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-neutral-600">
        <p className="text-center">{emptyMessage}</p>
        <Link href="/" className="mt-4 text-[var(--color-primary-500)] hover:underline">
          Return to homepage
        </Link>
      </div>
    );
  }

  return (
    <div
      className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
      role="list"
      aria-label="Product grid"
    >
      {products!.map((product) => {
        const cardProps: ProductCardProps = {
          id: product.id,
          name: product.name,
          slug: product.slug,
          priceNaira: product.priceNaira,
          salePriceNaira: product.salePriceNaira,
          images: product.images ?? [],
          isNew: product.isNew,
          isOnSale: product.isOnSale,
          stock: product.stock ?? 0,
        };

        return (
          <div key={product.id} role="listitem">
            <ProductCard
              {...cardProps}
              onAddToCart={() => onAddToCart?.(product)}
            />
          </div>
        );
      })}
    </div>
  );
}
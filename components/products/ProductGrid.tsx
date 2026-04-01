"use client";

import ProductCard from "./ProductCard";
import { Skeleton } from "@/components/ui/Skeleton";
import type { ProductWithRelations } from "@/lib/catalog/types";

type ProductGridProps = {
  products: ProductWithRelations[];
  isLoading?: boolean;
};

export default function ProductGrid({ products, isLoading }: ProductGridProps) {
  return (
    <div
      className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-safe animate-fadeIn"
      aria-busy={isLoading ? true : undefined}
      aria-live="polite"
    >
      {isLoading
        ? Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square" />
          ))
        : products.length
        ? products.map((p) => <ProductCard key={p.id} product={p} />)
        : (
          <div className="col-span-full flex flex-col items-center justify-center py-12 text-text-muted text-center max-w-xs mx-auto animate-fadeIn-fast">
            No products available
          </div>
        )}
    </div>
  );
}

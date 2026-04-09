"use client";

import ProductCard from "./ProductCard";
import ProductGridSkeleton from "./ProductGridSkeleton";
import type { ProductCardVM } from "@/lib/products/types";

type Props = {
  products: ProductCardVM[];
  isLoading?: boolean;
};

export default function ProductGrid({ products, isLoading }: Props) {
  return (
    <div
      className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 pb-safe animate-fadeIn"
      aria-busy={isLoading ? true : undefined}
      aria-live="polite"
    >
      {isLoading ? (
        <ProductGridSkeleton count={8} />
      ) : products.length > 0 ? (
        products.map((p) => <ProductCard key={p.id} product={p} />)
      ) : (
        <div className="col-span-full flex flex-col items-center justify-center py-12 text-text-muted text-center max-w-xs mx-auto animate-fadeIn-fast">
          No products available
        </div>
      )}
    </div>
  );
}
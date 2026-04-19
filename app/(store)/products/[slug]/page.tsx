"use client";

import ProductCard from "@/components/products/ProductCard";
import ProductGridSkeleton from "@/components/products/ProductGridSkeleton";
import type { ProductCardVM } from "@/lib/products/types";

type ProductGridProps = {
  products: ProductCardVM[];
  isLoading?: boolean;
};

export default function ProductGrid({ products, isLoading }: ProductGridProps) {
  return (
    <div
      role="list"
      aria-busy={isLoading ? true : undefined}
      aria-live="polite"
      className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 pb-safe animate-fadeIn"
    >
      {isLoading ? (
        <ProductGridSkeleton count={10} />
      ) : products.length > 0 ? (
        products.map((product) => (
          <div role="listitem" key={product.id} className="animate-fadeIn-fast">
            <ProductCard product={product} />
          </div>
        ))
      ) : (
        <div
          className="col-span-full flex flex-col items-center justify-center py-12 text-center text-text-muted animate-fadeIn-fast"
          role="status"
        >
          No products available right now.
        </div>
      )}
    </div>
  );
}

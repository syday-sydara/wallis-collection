// app/product/[slug]/page.tsx
"use client";

import ProductCard from "@/components/products/ProductCard";
import type { ProductCardVM } from "@/lib/catalog/types";

type ProductGridProps = {
  products: ProductCardVM[];
  isLoading?: boolean;
};

export default function ProductGrid({ products, isLoading }: ProductGridProps) {
  return (
    <div
      className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3"
      aria-busy={isLoading ? true : undefined}
    >
      {isLoading
        ? Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="aspect-square animate-pulse rounded-lg bg-surface-muted"
            />
          ))
        : products.length
        ? products.map((product) => <ProductCard key={product.id} product={product} />)
        : (
          <div className="col-span-full flex flex-col items-center justify-center py-12 text-center text-text-muted">
            No products available right now.
          </div>
        )}
    </div>
  );
}
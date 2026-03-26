// File: components/products/ProductGrid.tsx
"use client";

import ProductCard from "./ProductCard";
import Loading from "@/components/products/Loading";
import { ProductCardProps } from "@/components/products/ProductCard";

interface Props {
  products?: ProductCardProps[];
  loading?: boolean;
  onAddToCart?: (product: ProductCardProps) => void;
}

export default function ProductGrid({ products, loading, onAddToCart }: Props) {
  if (loading) {
    return (
      <div aria-live="polite">
        <Loading count={8} message="Loading products..." />
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <p className="text-center py-16 text-[var(--color-text-secondary)]">
        No products found.
      </p>
    );
  }

  return (
    <div
      className="
        grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4
        gap-4 sm:gap-6 lg:gap-8
      "
      data-grid="product-grid"
      data-count={products.length}
    >
      {products.map((product) => {
        // Safety check: ensure product.id exists
        if (!product.id) {
          console.error("Product missing id:", product);
        }

        // Remove any accidental `key` field from product object
        const { key, ...safeProduct } = product as any;

        return (
          <ProductCard
            key={product.id} // React key MUST be direct
            {...safeProduct}
            onAddToCart={onAddToCart ? () => onAddToCart(product) : undefined}
          />
        );
      })}
    </div>
  );
}

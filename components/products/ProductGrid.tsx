"use client";

import ProductCard from "./ProductCard";
import Loading from "@/components/products/Loading";
import { ProductCard as ProductCardType } from "@/lib/types/product";

interface Props {
  products?: ProductCardType[];
  loading?: boolean;
  onAddToCart?: (product: ProductCardType) => void;
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
        gap-[var(--spacing-md)]
      "
      data-grid="product-grid"
      data-count={products.length}
    >
      {products.map((product) => (
        <ProductCard
          key={product.id}
          {...product}
          onAddToCart={
            onAddToCart ? () => onAddToCart(product) : undefined
          }
        />
      ))}
    </div>
  );
}

// components/products/ProductGrid.tsx
"use client";

import ProductCard from "./ProductCard";
import Loading from "./Loading";

export interface Product {
  id: string;
  name: string;
  slug: string;
  priceNaira: number;
  images: string[];
  isNew?: boolean;
  isOnSale?: boolean;
  outOfStock?: boolean;
}

interface ProductGridProps {
  products?: Product[];
  loading?: boolean;
  onAddToCart?: (product: Product) => void;
}

export default function ProductGrid({
  products = [],
  loading = false,
  onAddToCart,
}: ProductGridProps) {
  if (loading) return <Loading />;

  if (!products.length) {
    return (
      <p className="text-center text-neutral-600 mt-10">
        No products found.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          {...product}
          onAddToCart={() => onAddToCart?.(product)}
        />
      ))}
    </div>
  );
}
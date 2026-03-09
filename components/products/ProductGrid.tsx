"use client";

import { useCallback } from "react";
import ProductCard from "./ProductCard";
import Loading from "@/components/products/Loading";

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
  const handleAddToCart = useCallback(
    (product: Product) => {
      onAddToCart?.(product);
    },
    [onAddToCart]
  );

  if (loading) {
    return <Loading count={8} message="Loading products..." />;
  }

  if (!products.length) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-neutral-600">
        <p className="text-center">No products found.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          {...product}
          onAddToCart={() => handleAddToCart(product)}
        />
      ))}
    </div>
  );
}

"use client";

import ProductCard from "./ProductCard";
import Loading from "@/components/products/Loading";

export interface Product {
  id: string;
  name: string;
  slug: string;
  priceNaira: number;
  salePriceNaira?: number;
  images: { url: string }[];
  isNew?: boolean;
  isOnSale?: boolean;
  stock?: number;
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
    <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
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

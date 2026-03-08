"use client";

import ProductCard from "./ProductCard";
import Skeleton from "@/components/ui/Skeleton";

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
  if (loading) {
    // Display a skeleton grid
    const skeletons = Array.from({ length: 8 }, (_, i) => (
      <div key={i} className="flex flex-col gap-3">
        <Skeleton shape="block" size="full" className="aspect-[3/4]" />
        <Skeleton shape="text" size="full" className="w-3/4" />
        <Skeleton shape="text" size="md" className="w-1/2" />
        <Skeleton shape="block" size="sm" className="w-full h-10" />
      </div>
    ));

    return <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">{skeletons}</div>;
  }

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
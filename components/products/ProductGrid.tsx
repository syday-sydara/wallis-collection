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
  if (loading) return <Loading count={8} message="Loading products..." />;

  if (!products || products.length === 0) return <p className="text-center py-16">No products found.</p>;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} {...product} onAddToCart={() => onAddToCart?.(product)} />
      ))}
    </div>
  );
}
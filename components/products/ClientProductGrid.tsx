// File: app/(public)/products/ClientProductGrid.tsx
"use client";

import ProductGrid from "@/components/products/ProductGrid";
import { ProductCardProps } from "@/components/products/ProductCard";

interface Props {
  products: ProductCardProps[];
}

export default function ClientProductGrid({ products }: Props) {
  function handleAddToCart(product: ProductCardProps) {
    console.log("Add to cart:", product.id);
    // integrate your cart logic here
  }

  return (
    <ProductGrid
      products={products}
      onAddToCart={handleAddToCart}
    />
  );
}

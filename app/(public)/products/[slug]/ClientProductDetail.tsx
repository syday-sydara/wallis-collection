// File: app/(public)/products/[slug]/ClientProductDetail.tsx
"use client";

import ProductDetailView from "@/components/products/ProductDetailView";
import { ProductDetailProps } from "@/lib/types/product";

interface Props {
  product: ProductDetailProps;
}

export default function ClientProductDetail({ product }: Props) {
  function handleAddToCart() {
    console.log("Add to cart:", product.id);
    // integrate your cart logic here
  }

  return (
    <ProductDetailView
      product={product}
      onAddToCart={handleAddToCart}
    />
  );
}

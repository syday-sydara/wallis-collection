// File: app/products/ClientProductGrid.tsx
"use client";

import { useState } from "react";
import ProductGrid from "@/components/products/ProductGrid";
import ProductCard from "@/components/products/ProductCard";
import Loading from "@/components/products/Loading";

interface ProductWithFormattedPrice {
  id: string;
  name: string;
  slug: string;
  images: any[];
  stock: number;
  isNew?: boolean;
  isOnSale?: boolean;
  formattedPrice: string;
  formattedSalePrice?: string | null;
}

export default function ClientProductGrid({ initialProducts }: { initialProducts: ProductWithFormattedPrice[] }) {
  const [products, setProducts] = useState(initialProducts);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchMore = async () => {
    setLoadingMore(true);
    try {
      const res = await fetch(`/api/products?page=${Math.ceil(products.length / 50) + 1}`);
      const data = await res.json();
      if (data?.data?.length) {
        setProducts((prev) => [...prev, ...data.data]);
      }
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <>
      <ProductGrid
        products={products.map((p) => (
          <ProductCard
            key={p.id}
            {...p}
            onAddToCart={() => console.log("Add to cart", p.id)}
          />
        ))}
        skeletonCount={8}
        loading={loadingMore}
      />

      {/* Infinite Scroll Trigger */}
      <div
        style={{ height: 8 }}
        ref={(el) => {
          if (!el) return;
          const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) fetchMore();
          });
          observer.observe(el);
        }}
      />

      {loadingMore && (
        <div className="mt-4 flex justify-center">
          <Loading count={4} showSpinner message="Loading more products..." />
        </div>
      )}
    </>
  );
}
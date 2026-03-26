// File: components/products/InfiniteProductList.tsx
"use client";

import { useState, useEffect } from "react";
import ClientProductGrid from "./ClientProductGrid";
import { ProductCard } from "@/lib/types/product";

export default function InfiniteProductList() {
  const [products, setProducts] = useState<(ProductCard & { formattedPrice?: string })[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/products?page=${page}`);
        const data = await res.json();
        if (data.success) {
          setProducts((prev) => [...prev, ...data.data]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [page]);

  const handleLoadMore = () => setPage((prev) => prev + 1);

  return (
    <div>
      <ClientProductGrid products={products} />
      <div className="mt-6 flex justify-center">
        <button
          className="px-6 py-2 bg-[var(--color-accent-500)] text-white rounded-md hover:bg-[var(--color-accent-600)] transition"
          onClick={handleLoadMore}
          disabled={loading}
        >
          {loading ? "Loading..." : "Load More"}
        </button>
      </div>
    </div>
  );
}
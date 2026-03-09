"use client";

import { useEffect, useState } from "react";
import ProductGrid, { Product } from "@/components/products/ProductGrid";
import { useCart } from "@/components/cart/cart-context";
import Loading from "@/components/products/Loading";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addItem } = useCart();

  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);

        // Optional: smooth loading experience
        const delay = new Promise((r) => setTimeout(r, 300));

        const res = await fetch("/api/products", { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to fetch products");

        const data: Product[] = await res.json();

        await delay;
        setProducts(data);
      } catch (err) {
        console.error(err);
        setError("Unable to load products at the moment.");
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  const handleAddToCart = (product: Product) => {
    if (!product?.id) return;

    addItem({
      id: product.id,
      name: product.name,
      price: product.priceNaira,
      quantity: 1,
      image: product.images[0] ?? "",
    });
  };

  return (
    <div className="py-10 max-w-7xl mx-auto px-4 space-y-8">
      <h1 className="heading-1 text-center">Shop African Fashion</h1>

      {loading && <Loading count={8} message="Loading products..." />}

      {!loading && error && (
        <p className="text-center text-red-500 font-medium">{error}</p>
      )}

      {!loading && !error && !products.length && (
        <p className="text-center text-neutral-600 font-medium">
          No products found.
        </p>
      )}

      {!loading && !error && products.length > 0 && (
        <ProductGrid products={products} onAddToCart={handleAddToCart} />
      )}
    </div>
  );
}

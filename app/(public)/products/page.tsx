"use client";

import { useEffect, useState } from "react";
import ProductGrid from "@/components/products/ProductGrid";
import type { Product } from "@/components/products/ProductGrid";
import { useCart } from "@/components/cart/cart-context";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { addItem } = useCart(); // CartDrawer hook

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch("/api/products");
        const data = await res.json();
        setProducts(data);
      } catch (err) {
        console.error("Failed to fetch products:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  const handleAddToCart = (id: string) => {
    const product = products.find((p) => p.id === id);
    if (!product) return;
    addItem({
      id: product.id,
      name: product.name,
      price: product.priceCents,
      quantity: 1,
      image: product.images[0],
    });
  };

  return (
    <div className="py-10 max-w-7xl mx-auto px-4">
      <h1 className="heading-1 mb-6">Shop African Fashion</h1>

      <ProductGrid
        products={products}
        loading={loading}
        onAddToCart={handleAddToCart}
      />
    </div>
  );
}
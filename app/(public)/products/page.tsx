"use client";

import { useEffect, useState } from "react";
import ProductGrid, { Product } from "@/components/products/ProductGrid";
import { useCart } from "@/components/cart/cart-context";
import Loading from "@/components/ui/Loading";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addItem } = useCart();

  // Fetch products from API
  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);
        const res = await fetch("/api/products");
        if (!res.ok) throw new Error("Failed to fetch products");
        const data: Product[] = await res.json();
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

  // Add item to cart safely
  const handleAddToCart = (product: Product) => {
    if (!product || !product.id) return;
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

      {/* Loading State */}
      {loading && <Loading count={8} message="Loading products..." />}

      {/* Error State */}
      {!loading && error && (
        <p className="text-center text-red-500 font-medium">{error}</p>
      )}

      {/* Empty State */}
      {!loading && !error && !products.length && (
        <p className="text-center text-neutral-600 font-medium">
          No products found.
        </p>
      )}

      {/* Product Grid */}
      {!loading && !error && products.length > 0 && (
        <ProductGrid products={products} onAddToCart={handleAddToCart} />
      )}
    </div>
  );
}
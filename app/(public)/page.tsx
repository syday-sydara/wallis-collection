"use client";

import React, { useEffect, useState } from "react";
import ProductGrid, { Product } from "@/components/products/ProductGrid";

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setProducts([
        { id: "1", name: "Elegant Shoes", slug: "elegant-shoes", priceNaira: 15000, images: ["/images/shoes.png"], isNew: true },
        { id: "2", name: "Leather Bag", slug: "leather-bag", priceNaira: 8000, images: ["/images/bag.png"], isOnSale: true },
        { id: "3", name: "Wrist Watch", slug: "wrist-watch", priceNaira: 12000, images: ["/images/watch.png"] },
        { id: "4", name: "Sunglasses", slug: "sunglasses", priceNaira: 5000, images: ["/images/sunglasses.png"], outOfStock: true },
      ]);
      setLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handleAddToCart = (product: Product) => {
    alert(`Added ${product.name} to cart`);
  };

  return (
    <div className="space-y-10">
      {/* Hero */}
      <section className="bg-primary-500 text-white rounded-lg p-8 flex flex-col items-center justify-center text-center">
        <h1 className="heading-display mb-4">Welcome to Wallis Collection</h1>
        <p className="text-lg mb-4">
          Discover elegant products for every occasion.
        </p>
      </section>

      {/* Featured Products */}
      <section>
        <h2 className="heading-2 mb-4">Featured Products</h2>
        <ProductGrid products={products} loading={loading} onAddToCart={handleAddToCart} />
      </section>

      {/* Categories */}
      <section>
        <h2 className="heading-2 mb-4">Shop by Category</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="card p-6 text-center">Shoes</div>
          <div className="card p-6 text-center">Bags</div>
          <div className="card p-6 text-center">Watches</div>
          <div className="card p-6 text-center">Sunglasses</div>
        </div>
      </section>
    </div>
  );
}
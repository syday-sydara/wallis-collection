"use client";

import Image from "next/image";
import ProductGrid, { Product } from "@/components/products/ProductGrid";
import { useCart } from "@/components/cart/cart-context";
import { useEffect, useState } from "react";
import Skeleton from "@/components/ui/Skeleton";

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { addItem } = useCart();

  // Fetch products
  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch("/api/products");
        const data = await res.json();

        const formatted: Product[] = data.map((p: Product, i: number) => ({
          ...p,
          images:
            p.images?.length
              ? p.images
              : [`https://picsum.photos/600/800?random=${i + 1}`],
        }));

        setProducts(formatted);
      } catch (err) {
        console.error("Failed to fetch products:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  const handleAddToCart = (product: Product) => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.priceNaira,
      quantity: 1,
      image: product.images[0],
    });
  };

  return (
    <main className="space-y-20">
      {/* Hero Section */}
      <section className="relative w-full h-[500px] md:h-[600px] bg-[var(--color-bg-surface)] flex items-center justify-center overflow-hidden rounded-lg">
        <Image
          src="https://picsum.photos/1920/600?random=20"
          alt="Wallis Collection Hero"
          fill
          sizes="100vw"
          className="object-cover object-center"
        />

        <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-center text-white px-4">
          <h1 className="heading-display mb-4">
            Timeless Nigerian Fashion
          </h1>

          <p className="text-lg mb-6 max-w-xl text-white/90">
            Discover curated wax, super‑wax, abayas, ankara, hollands, and lace pieces.
          </p>

          <a href="/products" className="btn btn-primary px-6 py-3 text-lg">
            Shop Now
          </a>
        </div>
      </section>

      {/* Product Sections */}
      <div className="mx-auto max-w-[1280px] px-4 py-10 space-y-20">
        {/* Featured Products */}
        <section>
          <h2 className="heading-2 mb-6">Featured Products</h2>
          {loading ? (
            <ProductGridSkeleton />
          ) : (
            <ProductGrid products={products} onAddToCart={handleAddToCart} />
          )}
        </section>

        {/* New Arrivals */}
        <section>
          <h2 className="heading-2 mb-6">New Arrivals</h2>
          {loading ? (
            <ProductGridSkeleton />
          ) : (
            <ProductGrid products={products} onAddToCart={handleAddToCart} />
          )}
        </section>

        {/* Best Sellers */}
        <section>
          <h2 className="heading-2 mb-6">Best Sellers</h2>
          {loading ? (
            <ProductGridSkeleton />
          ) : (
            <ProductGrid products={products} onAddToCart={handleAddToCart} />
          )}
        </section>
      </div>
    </main>
  );
}

/* ------------------------------ */
/* Skeleton Loader                */
/* ------------------------------ */
function ProductGridSkeleton() {
  const skeletons = Array.from({ length: 8 });

  return (
    <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
      {skeletons.map((_, i) => (
        <div
          key={i}
          className="flex flex-col bg-[var(--color-bg-surface)] rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.06)] overflow-hidden"
        >
          <div className="relative aspect-[3/4] w-full overflow-hidden">
            <Skeleton className="w-full h-full" />
          </div>

          <div className="p-4 flex flex-col flex-1 space-y-2">
            <Skeleton className="w-3/4 h-4" />
            <Skeleton className="w-1/2 h-4" />
            <Skeleton className="w-full h-10 mt-auto" />
          </div>
        </div>
      ))}
    </div>
  );
}

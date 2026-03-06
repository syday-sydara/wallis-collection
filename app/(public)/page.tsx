// File: app/(public)/page.tsx
import Link from "next/link";
import { prisma } from "@/lib/db";
import ProductCard from "@/components/ui/ProductCard";
import type { Product } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  // Fetch latest 8 products (or filter by featured flag if you add one later)
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    take: 8,
  });

  return (
    <div className="space-y-32">
      {/* Hero Section */}
      <section className="container grid md:grid-cols-2 gap-12 items-center py-20">
        <div className="space-y-6">
          <h1 className="text-5xl md:text-6xl font-heading font-semibold tracking-tight text-primary">
            Modern. Minimal. Effortless shopping.
          </h1>

          <p className="text-secondary text-lg md:text-xl">
            A clean single‑store experience built with Next.js 16 + Tailwind CSS.
          </p>

          <Link
            href="/products"
            className="inline-block px-8 py-3 bg-primary text-white rounded-full text-sm font-medium shadow hover:opacity-90 transition ease-smooth duration-400"
          >
            Shop now
          </Link>
        </div>

        <div className="h-96 rounded-3xl bg-neutral/20 border border-neutral/40 flex items-center justify-center">
          <span className="text-neutral text-sm">Hero image</span>
        </div>
      </section>

      {/* Featured Products */}
      <section className="container">
        <h2 className="text-2xl font-heading font-semibold mb-8 text-primary">
          Featured products
        </h2>

        {products.length === 0 ? (
          <p className="text-neutral">No products available yet.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product as Product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

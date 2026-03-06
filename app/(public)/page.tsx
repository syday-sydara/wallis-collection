// File: app/(public)/page.tsx
import Link from "next/link";
import { prisma } from "@/lib/db";
import ProductCard from "@/components/ui/ProductCard";
import type { Product } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    take: 12,
  });

  return (
    <main className="container py-16">
      <h1 className="text-3xl font-semibold mb-10">Products</h1>

      {products.length === 0 ? (
        <p className="text-neutral">No products available yet.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product as Product} />
          ))}
        </div>
      )}
    </main>
  );
}
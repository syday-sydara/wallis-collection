// File: app/(public)/page.tsx
import { prisma } from "@/lib/db";
import ProductCard from "@/components/ui/ProductCard";
import type { Product } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    take: 12,
    select: {
      id: true,
      name: true,
      price: true,
      image: true,
      slug: true,
      createdAt: true,
    },
  });

  return (
    <>
      <h1 className="heading-1 mb-12 text-primary tracking-tight">
        Products
      </h1>

      {products.length === 0 ? (
        <p className="label text-neutral">No products available yet.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-8">
          {products.map((product) => (
            <ProductCard key={product.id} product={product as Product} />
          ))}
        </div>
      )}
    </>
  );
}
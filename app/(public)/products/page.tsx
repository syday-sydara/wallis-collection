import { prisma } from "@/lib/db";
import ProductCard from "@/components/ui/ProductCard";
import type { Product } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      slug: true,
      priceNaira: true,
      images: true,
      category: true,
      stock: true,
      createdAt: true,
    },
  });

  return (
    <div className="space-y-14 py-20">
      <div className="flex items-center justify-between">
        <h1 className="heading-1 text-primary tracking-tight">
          All Products
        </h1>

        <span className="label text-neutral">
          {products.length} items
        </span>
      </div>

      {products.length === 0 ? (
        <div className="py-24 text-center">
          <p className="label text-neutral">No products available yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-10">
          {products.map((product) => (
            <ProductCard key={product.id} product={product as Product} />
          ))}
        </div>
      )}
    </div>
  );
}
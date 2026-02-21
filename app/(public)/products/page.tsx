// File: app/(public)/products/page.tsx
import { prisma } from "@/lib/db";
import ProductCard from "@/components/ui/ProductCard";

export default async function ProductsPage() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="container mx-auto py-16 space-y-12">
      
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold text-gray-900">
          All Products
        </h1>

        <span className="text-sm text-gray-500">
          {products.length} items
        </span>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-24 text-gray-500">
          No products available yet.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-8">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
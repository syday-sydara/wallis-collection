// File: app/(public)/products/page.tsx
import { prisma } from "@/lib/db";
import ProductCard from "@/components/ui/ProductCard";

export default async function ProductsPage() {
  // Fetch the latest products from the database
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    take: 12, // limit to 12 for grid
  });

  return (
    <div className="container py-16 space-y-12">
      <h1 className="text-3xl font-heading font-semibold text-primary">
        Products
      </h1>

      {products.length === 0 ? (
        <p className="text-gray-500">No products available yet.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
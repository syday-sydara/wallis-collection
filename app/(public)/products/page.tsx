import { Suspense } from "react";
import { prisma } from "@/lib/db";
import ClientProductGrid from "./ClientProductGrid";
import Loading from "@/components/products/Loading";
import { cache } from "react";

/**
 * Fetch products from Prisma with caching.
 * Uses `cache` for React Server Components (RSC) optimization.
 */
const getAllProducts = cache(async () => {
  const products = await prisma.product.findMany({
    where: { deletedAt: null },
    include: {
      images: { orderBy: { position: "asc" } },
    },
    orderBy: { createdAt: "desc" },
    take: 50, // Limit for performance
  });

  return products.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    price: p.priceNaira, // Ensure correct currency field
    salePrice: p.salePriceNaira ?? undefined,
    images: p.images?.map((img) => ({ url: img.url })) ?? [],
    isNew: p.isNew ?? false,
    isOnSale: p.salePriceNaira != null,
    stock: p.stock,
  }));
});

// Revalidate every 5 minutes
export const revalidate = 300;

export default async function ProductsPage() {
  const initialProducts = await getAllProducts();

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="heading-2 mb-6 text-center md:text-left">
        All Products
      </h1>

      <Suspense fallback={<Loading count={8} message="Loading products..." />}>
        <ClientProductGrid initialProducts={initialProducts} />
      </Suspense>
    </main>
  );
}
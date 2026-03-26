import { Suspense } from "react";
import { prisma } from "@/lib/db";
import ProductGrid from "@/components/products/ProductGrid";
import Loading from "@/components/products/Loading";
import ClientProductGrid from "./ClientProductGrid";
import { cache } from "react";

const getAllProducts = cache(async () => {
  const products = await prisma.product.findMany({
    where: { deletedAt: null },
    include: { images: { orderBy: { position: "asc" } } },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return products.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    price: p.price,
    salePrice: p.salePrice ?? undefined,
    images: p.images?.map((img) => ({ url: img.url })) ?? [],
    isNew: p.isNew ?? false,
    isOnSale: p.salePrice != null,
    stock: p.stock,
  }));
});

export const revalidate = 300;

export default async function ProductsPage() {
  const initialProducts = await getAllProducts();

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="heading-2 mb-6">All Products</h1>

      <Suspense fallback={<Loading count={8} message="Loading products..." />}>
        <ClientProductGrid initialProducts={initialProducts} />
      </Suspense>
    </main>
  );
}
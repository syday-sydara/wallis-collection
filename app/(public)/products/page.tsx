// File: app/(public)/products/page.tsx
import { prisma } from "@/lib/db";
import { mapProductCard } from "@/lib/mappers/product";
import ClientProductGrid from "@/components/products/ClientProductGrid";

export const revalidate = 60;

export default async function ProductsPage() {
  const products = await prisma.product.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: "desc" },
    include: {
      images: true,
      variants: true,
    },
  });

  const mapped = products.map(mapProductCard);

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      <ClientProductGrid products={mapped} />
    </main>
  );
}

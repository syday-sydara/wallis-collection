import { prisma } from "@/lib/db";
import ProductGrid from "@/components/products/ProductGrid";
import { mapProductCard } from "@/lib/mappers/product";

export default async function ProductsPage() {
  const products = await prisma.product.findMany({
    include: {
      images: true,
      variants: true,
    },
  });

  // ❗ Convert Prisma objects → ProductCardProps
  const mapped = products.map(mapProductCard);

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      <ProductGrid products={mapped} />
    </main>
  );
}

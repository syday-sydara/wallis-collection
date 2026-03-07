// File: app/(public)/page.tsx
import prisma from "@/lib/db";
import ProductCard from "@/components/ui/ProductCard";

// Cache products for 60 seconds
export const revalidate = 60;

// Product type based on Prisma select
type ProductCardData = {
  id: string;
  name: string;
  slug: string;
  priceNaira: number;
  images: string[];
  category: string | null;
  createdAt: Date;
  stock: number;
};

export default async function HomePage() {
  const products: ProductCardData[] = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    take: 12,
    select: {
      id: true,
      name: true,
      slug: true,
      priceNaira: true,
      images: true,
      category: true,
      createdAt: true,
      stock: true,
    },
  });

  return (
    <section className="space-y-12">
      <h1 className="heading-1 tracking-tight text-primary-500">
        Products
      </h1>

      {products.length === 0 ? (
        <p className="label text-neutral-600">
          No products available yet.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 md:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
}
// File: app/(public)/page.tsx
import prisma from "@/lib/db";
import ProductCard from "@/components/ui/ProductCard";

// Optional: cache for 60 seconds instead of force-dynamic
export const revalidate = 60;

// Strongly typed product shape based on Prisma query
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
    <>
      <h1 className="heading-1 mb-12 text-primary tracking-tight">
        Products
      </h1>

      {products.length === 0 ? (
        <p className="label text-neutral">No products available yet.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-8">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </>
  );
}
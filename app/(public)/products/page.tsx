import { prisma } from "@/lib/db";
import ProductCard from "@/components/products/ProductCard"; // Assuming you have a ProductCard component to render each product.
import Loading from "@/components/products/Loading";
import { Metadata } from "next";
import { cache } from "react";

const getAllProducts = cache(async () => {
  return await prisma.product.findMany({
    where: {
      deletedAt: null,
    },
    include: {
      images: {
        orderBy: {
          position: "asc",
        },
      },
    },
  });
});

export const revalidate = 300;

export default async function ProductPage() {
  const products = await getAllProducts();

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold mb-4">All Products</h1>
      {products.length === 0 ? (
        <Loading count={8} variant="grid" showSpinner={true} message="Loading products..." />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </main>
  );
}
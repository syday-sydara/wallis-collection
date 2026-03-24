import { prisma } from "@/lib/db";
import ProductCard from "@/components/products/ProductCard";
import Loading from "@/components/products/Loading";
import { Metadata } from "next";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "All Products",
  description: "Browse all available products",
};

const getAllProducts = async () => {
  return prisma.product.findMany({
    where: {
      deletedAt: null,
    },
    select: {
      id: true,
      name: true,
      price: true,
      images: {
        take: 1,
        orderBy: { position: "asc" },
        select: { url: true },
      },
    },
  });
};

export default async function ProductPage() {
  let products = [];

  try {
    products = await getAllProducts();
  } catch (error) {
    console.error(error);
    return (
      <p className="text-center text-red-500 py-10">
        Failed to load products.
      </p>
    );
  }

  if (products.length === 0) {
    return (
      <p className="text-center text-gray-500 py-10">
        No products available.
      </p>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold mb-4">All Products</h1>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </main>
  );
}
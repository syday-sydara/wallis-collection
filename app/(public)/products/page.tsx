// app/(public)/products/page.tsx
import { prisma } from "@/lib/db";
import ProductGrid from "@/components/products/ProductGrid";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "All Products – Wallis Collection",
  description:
    "Explore premium Northern Nigerian fashion crafted with elegance, heritage, and modern design.",
  alternates: {
    canonical: "https://walliscollection.com/products",
  },
  openGraph: {
    title: "All Products – Wallis Collection",
    description:
      "Explore premium Northern Nigerian fashion crafted with elegance, heritage, and modern design.",
    url: "https://walliscollection.com/products",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "All Products – Wallis Collection",
    description:
      "Explore premium Northern Nigerian fashion crafted with elegance, heritage, and modern design.",
  },
};

export default async function ProductsPage() {
  const products = await prisma.product.findMany({
    where: { deletedAt: null },
    include: { images: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-10">
      <h1 className="heading-2 mb-8">All Products</h1>
      <ProductGrid products={products} />
    </div>
  );
}
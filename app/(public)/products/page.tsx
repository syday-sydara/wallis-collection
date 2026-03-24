// app/(public)/products/page.tsx
import { prisma } from "@/lib/db";
import ProductGrid from "@/components/products/ProductGrid";
import { Metadata } from "next";
import { Suspense } from "react";
import Loading from "@/components/products/Loading";

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
    images: [
      {
        url: "https://walliscollection.com/og/products.jpg",
        width: 1200,
        height: 630,
        alt: "Wallis Collection Products",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "All Products – Wallis Collection",
    description:
      "Explore premium Northern Nigerian fashion crafted with elegance, heritage, and modern design.",
    images: ["https://walliscollection.com/og/products.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

async function fetchProducts() {
  return prisma.product.findMany({
    where: { deletedAt: null },
    include: { images: true },
    orderBy: { createdAt: "desc" },
  });
}

export default async function ProductsPage() {
  const productsPromise = fetchProducts();

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-12">
      <header className="mb-10">
        <h1 className="heading-2">All Products</h1>
        <p className="text-[var(--color-text-secondary)] mt-2 text-sm">
          Discover our latest arrivals and timeless pieces crafted with
          elegance and heritage.
        </p>
      </header>

      <Suspense fallback={<Loading count={12} message="Loading products..." />}>
        <ProductGrid products={await productsPromise} />
      </Suspense>
    </div>
  );
}
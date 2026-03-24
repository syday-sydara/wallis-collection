import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import ProductDetailView from "@/components/products/ProductDetailView";
import { Metadata } from "next";

interface Props {
  params: { slug: string };
}

// 1. Generate Metadata dynamically for SEO
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await prisma.product.findUnique({
    where: { slug: params.slug },
  });

  if (!product) return { title: "Product Not Found" };

  return {
    title: `${product.name} | Wallis Collection`,
    description: product.description,
    openGraph: {
      images: [product.images?.[0]?.url || ""],
    },
  };
}

export default async function ProductPage({ params }: Props) {
  // 2. Fetch product with related images
  const product = await prisma.product.findUnique({
    where: { 
      slug: params.slug,
      deletedAt: null // Ensure we don't show deleted items
    },
    include: {
      images: {
        orderBy: { position: 'asc' }
      }
    }
  });

  if (!product) {
    notFound();
  }

  // 3. Map Database Kobo (Int) back to Naira (Float) for the frontend view
  const formattedProduct = {
    ...product,
    priceNaira: product.price / 100,
    salePriceNaira: product.salePrice ? product.salePrice / 100 : null,
  };

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      <ProductDetailView product={formattedProduct} />
    </main>
  );
}
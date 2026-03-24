import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import ProductDetailView from "@/components/products/ProductDetailView";
import { Metadata } from "next";
import { cache } from "react";
import { formatProduct } from "@/lib/utils/formatProduct";

interface Props {
  params: { slug: string };
}

export const revalidate = 300;

const getProduct = cache(async (slug: string) => {
  return prisma.product.findUnique({
    where: {
      slug,
      deletedAt: null,
    },
    include: {
      images: {
        orderBy: { position: "asc" },
      },
    },
  });
});

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await getProduct(params.slug);

  if (!product) return { title: "Product Not Found" };

  return {
    title: `${product.name} | Wallis Collection`,
    description: product.description,
    openGraph: {
      images: product.images?.length
        ? [product.images[0].url]
        : ["/fallback-product.jpg"],
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const product = await getProduct(params.slug);

  if (!product) notFound();

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      <ProductDetailView product={formatProduct(product)} />
    </main>
  );
}
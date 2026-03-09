import { prisma } from "@/lib/db";
import ProductDetailView from "./ProductDetailView";
import { Metadata } from "next";
import { notFound } from "next/navigation";

interface ProductPageProps {
  params: { slug: string };
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const product = await prisma.product.findUnique({
    where: { slug: params.slug, deletedAt: null },
    include: { images: true },
  });

  if (!product) {
    return {
      title: "Product not found",
      robots: { index: false, follow: false },
    };
  }

  const fallbackImage =
    "https://images.unsplash.com/photo-1520975918318-3a4e6e791f6b?q=80&w=1200&auto=format&fit=crop";

  return {
    title: product.name,
    description: product.description ?? "",
    openGraph: {
      title: product.name,
      description: product.description ?? "",
      images:
        product.images.length > 0
          ? product.images.map((img) => ({
              url: img.url,
              width: 1200,
              height: 630,
              alt: product.name,
            }))
          : [
              {
                url: fallbackImage,
                width: 1200,
                height: 630,
                alt: product.name,
              },
            ],
    },
  };
}

export default async function ProductDetailPage({
  params,
}: ProductPageProps) {
  const product = await prisma.product.findUnique({
    where: { slug: params.slug, deletedAt: null },
    include: { images: true, reviews: true },
  });

  if (!product) notFound();

  return <ProductDetailView product={product} />;
}

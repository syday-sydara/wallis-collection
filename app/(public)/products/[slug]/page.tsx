import { prisma } from "@/lib/db";
import ProductDetailView from "./ProductDetailView";
import { Metadata } from "next";

interface ProductPageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const product = await prisma.product.findUnique({
    where: { slug: params.slug },
  });

  if (!product) return { title: "Product not found" };

  return {
    title: product.name,
    description: product.description ?? "",
    openGraph: {
      title: product.name,
      description: product.description ?? "",
      images: product.images?.map((img) => ({
        url: img,
        width: 1200,
        height: 630,
        alt: product.name,
      })) ?? [],
    },
  };
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const product = await prisma.product.findUnique({
    where: { slug: params.slug },
    include: { images: true, reviews: true },
  });

  if (!product) {
    return <p className="text-center text-red-500 mt-10">Product not found</p>;
  }

  return <ProductDetailView product={product} />;
}

import { prisma } from "@/lib/db";
import ProductDetailView from "./ProductDetailView";
import { Metadata } from "next";
import { notFound } from "next/navigation";

interface ProductPageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  let product = null;

  try {
    product = await prisma.product.findUnique({
      where: { slug: params.slug },
      include: { images: true },
    });
  } catch (err) {
    console.error("Metadata Prisma Error:", err);
  }

  if (!product || product.deletedAt) {
    return {
      title: "Product not found",
      description: "This product does not exist.",
      robots: { index: false, follow: false },
    };
  }

  const fallbackImage =
    "https://images.unsplash.com/photo-1520975918318-3a4e6e791f6b?q=80&w=1200&auto=format&fit=crop";

  const ogImages =
    product.images?.length > 0
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
        ];

  const description =
    product.description?.slice(0, 200) ??
    "Premium Northern Nigerian fashion crafted with elegance and heritage.";

  return {
    title: product.name,
    description,
    alternates: {
      canonical: `https://walliscollection.com/products/${product.slug}`,
    },
    openGraph: {
      title: product.name,
      description,
      url: `https://walliscollection.com/products/${product.slug}`,
      type: "product",
      siteName: "Wallis Collection",
      images: ogImages,
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      description,
      images: ogImages.map((img) => img.url),
    },
  };
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const product = await prisma.product.findUnique({
    where: { slug: params.slug },
    include: { images: true, reviews: true },
  });

  if (!product || product.deletedAt) notFound();

  return <ProductDetailView product={product} />;
}
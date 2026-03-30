import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProductBySlug } from "@/lib/catalog/service";
import ProductClient from "./ProductClient";

export const revalidate = 60;

interface Props {
  params: { slug: string };
}

// -----------------------------
// Metadata
// -----------------------------
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await getProductBySlug(params.slug);

  if (!product) {
    return {
      title: "Product Not Found — Wallis Collection",
    };
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL;

  return {
    title: `${product.name} — Wallis Collection`,
    description: product.description ?? "Premium Nigerian fashion.",
    alternates: {
      canonical: `${baseUrl}/product/${params.slug}`,
    },
    openGraph: {
      type: "website",
      title: product.name,
      description: product.description ?? "",
      images: product.images.map((i) => i.url),
    },
  };
}

// -----------------------------
// Page
// -----------------------------
export default async function Page({ params }: Props) {
  let product;

  try {
    product = await getProductBySlug(params.slug);
  } catch {
    return notFound();
  }

  if (!product || product.isArchived || product.deletedAt) {
    return notFound();
  }

  // Minimal view model (keep it simple)
  const viewModel = {
    id: product.id,
    name: product.name,
    description: product.description,
    price: product.discountPrice ?? product.basePrice,
    images: product.images,
    variants: product.variants,
    inStock: product.stock > 0,
  };

  return <ProductClient product={viewModel} slug={params.slug} />;
}
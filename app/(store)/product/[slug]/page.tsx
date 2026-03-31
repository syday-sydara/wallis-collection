// app/product/[slug]/page.tsx
import { notFound } from "next/navigation";
import { getProductBySlug } from "@/lib/catalog/service";
import ProductClient from "./ProductClient";

export const revalidate = 60;

export default async function Page({ params }: { params: { slug: string } }) {
  const product = await getProductBySlug(params.slug).catch(() => null);

  if (!product || product.isArchived || product.deletedAt) {
    return notFound();
  }

  const stock = product.inventory.reduce((sum, m) => sum + m.change, 0);
  const prices = product.variants.map((v) => v.price);
  const minPrice = prices.length ? Math.min(...prices) : 0;
  const maxPrice = prices.length ? Math.max(...prices) : 0;

  const viewModel = {
    id: product.id,
    name: product.name,
    description: product.description ?? "",
    images: product.images,
    variants: product.variants,
    stock,
    minPrice,
    maxPrice,
    inStock: stock > 0,
  };

  return <ProductClient product={viewModel} slug={params.slug} />;
}

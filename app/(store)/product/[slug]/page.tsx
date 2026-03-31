// app/product/[slug]/page.tsx
import { notFound } from "next/navigation";
import { getProductDetailWithRecommendations } from "@/lib/catalog/service";
import ProductClient from "./ProductClient";

export const revalidate = 60;

export default async function Page({ params }: { params: { slug: string } }) {
  const data = await getProductDetailWithRecommendations(params.slug).catch(() => null);

  if (!data) return notFound();

  const { product, recommendations } = data;

  // Calculate stock
  const stock = product.variants.reduce((sum, v) => sum + v.price, 0);

  // Calculate min/max prices
  const prices = product.variants.map(v => v.price);
  const minPrice = prices.length ? Math.min(...prices) : product.basePrice;
  const maxPrice = prices.length ? Math.max(...prices) : product.basePrice;

  const viewModel = {
    ...product,
    stock,
    minPrice,
    maxPrice,
    inStock: stock > 0,
    recommended: recommendations
  };

  return <ProductClient product={viewModel} slug={params.slug} />;
}
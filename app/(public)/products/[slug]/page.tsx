// File: app/(public)/products/[slug]/page.tsx
import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import ProductGallery from "@/components/ui/ProductGallery";
import AddToCartSection from "@/components/ui/AddToCartSection";
import StickyAddToCart from "@/components/ui/StickyAddToCart";
import ProductCard from "@/components/ui/ProductCard";
import { formatPrice } from "@/lib/formatters";
import type { Product } from "@/lib/types";

export const dynamic = "force-dynamic";

type Props = {
  params: { slug: string };
};

export default async function ProductDetailPage({ params }: Props) {
  const product = await prisma.product.findUnique({
    where: { slug: params.slug },
    select: {
      id: true,
      name: true,
      slug: true,
      priceNaira: true,
      description: true,
      category: true,
      images: true,
      stock: true,
      createdAt: true,
    },
  });

  if (!product) return notFound();

  const relatedProducts = await prisma.product.findMany({
    where: product.category
      ? { category: product.category, NOT: { id: product.id } }
      : { NOT: { id: product.id } },
    take: 4,
    select: {
      id: true,
      name: true,
      slug: true,
      priceNaira: true,
      images: true,
      category: true,
      stock: true,
    },
  });

  const price = formatPrice(product.priceNaira);

  return (
    <div className="space-y-24 py-20">
      {/* Main Section */}
      <div className="grid md:grid-cols-2 gap-20">
        <ProductGallery images={product.images as string[]} />

        <div className="space-y-8">
          {/* Category */}
          {product.category && (
            <span className="label text-accent">{product.category}</span>
          )}

          {/* Product Name */}
          <h1 className="heading-1 text-primary tracking-tight">
            {product.name}
          </h1>

          {/* Price */}
          <p className="text-2xl font-semibold text-secondary tracking-tight">
            {price}
          </p>

          {/* Description */}
          {product.description && (
            <p className="text-neutral leading-relaxed text-base">
              {product.description}
            </p>
          )}

          {/* Desktop Add to Cart */}
          <div className="hidden md:block">
            <AddToCartSection product={product} />
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="space-y-10">
          <h2 className="heading-2 text-primary tracking-tight">
            Related Products
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-10">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p as Product} />
            ))}
          </div>
        </div>
      )}

      {/* Sticky Mobile Add to Cart */}
      <StickyAddToCart product={product} />
    </div>
  );
}
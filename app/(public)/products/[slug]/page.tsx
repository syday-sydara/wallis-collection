// File: app/(public)/products/[slug]/page.tsx
import prisma from "@/lib/db"
import { notFound } from "next/navigation"
import ProductGallery from "@/components/ui/ProductGallery"
import AddToCartSection from "@/components/ui/AddToCartSection"
import StickyAddToCart from "@/components/ui/StickyAddToCart"
import ProductCard from "@/components/ui/ProductCard"
import { formatPrice } from "@/lib/formatters"
import type { ProductCardData } from "@/lib/types"

export const revalidate = 60

// Strong type for the product detail page
type ProductDetailData = {
  id: string
  name: string
  slug: string
  priceNaira: number
  description: string | null
  category: string | null
  images: string[]
  stock: number
  createdAt: Date
}

type Props = {
  params: { slug: string }
}

export default async function ProductDetailPage({ params }: Props) {
  if (!params?.slug) return notFound()

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
  })

  if (!product) return notFound()

  // Fetch related products (same category, exclude current)
  const relatedProducts: ProductCardData[] = await prisma.product.findMany({
    where: {
      id: { not: product.id },
      ...(product.category ? { category: product.category } : {}),
    },
    take: 4,
    select: {
      id: true,
      name: true,
      slug: true,
      priceNaira: true,
      images: true,
      category: true,
      stock: true,
      createdAt: true,
    },
  })

  const formattedPrice = formatPrice(product.priceNaira)

  return (
    <div className="space-y-24 py-20">
      {/* Product Section */}
      <div className="grid md:grid-cols-2 gap-20">
        <ProductGallery images={product.images} />

        <div className="space-y-8">
          {product.category && (
            <span className="label text-accent">{product.category}</span>
          )}

          <h1 className="heading-1 text-primary tracking-tight">
            {product.name}
          </h1>

          <p className="text-2xl font-semibold text-secondary tracking-tight">
            {formattedPrice}
          </p>

          {product.description && (
            <p className="text-neutral leading-relaxed text-base">
              {product.description}
            </p>
          )}

          {/* Desktop Add to Cart */}
          <div className="hidden md:block">
            <AddToCartSection product={{ ...product, formattedPrice }} />
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
              <ProductCard
                key={p.id}
                product={{ ...p, formattedPrice: formatPrice(p.priceNaira) }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Sticky Add to Cart (Mobile) */}
      <StickyAddToCart product={{ ...product, formattedPrice }} />
    </div>
  )
}
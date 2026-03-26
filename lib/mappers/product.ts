// PATH: lib/mappers/product.ts

import { ProductVariant, ProductImage } from "@prisma/client";
import { ProductCardProps } from "@/components/products/ProductCard";

/* ------------------------------------------------------------
   Normalize images → { url: string }[]
------------------------------------------------------------- */
function normalizeImages(images: ProductImage[]): { url: string }[] {
  return images
    .sort((a, b) => a.position - b.position)
    .map((img) => ({ url: img.url }));
}

/* ------------------------------------------------------------
   Map Product → ProductCardProps (UI-ready)
------------------------------------------------------------- */
export function mapProductCard(product: {
  id: string;
  name: string;
  slug: string;
  price: number;
  salePrice: number | null;
  isNew: boolean;
  images: ProductImage[];
  variants: ProductVariant[];
}): ProductCardProps {
  const priceNaira = product.price / 100;
  const saleNaira = product.salePrice ? product.salePrice / 100 : null;

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,

    images: normalizeImages(product.images),

    price: priceNaira,
    salePrice: saleNaira,
    isOnSale: saleNaira !== null && saleNaira < priceNaira,

    isNew: product.isNew,

    stock: product.variants.reduce((sum, v) => sum + v.stock, 0),
  };
}

/* ------------------------------------------------------------
   Map Product → ProductDetail (still domain-level)
------------------------------------------------------------- */
export function mapProductDetail(product: {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  salePrice: number | null;
  isNew: boolean;
  images: ProductImage[];
  variants: ProductVariant[];
  reviews: any[];
}) {
  const priceNaira = product.price / 100;
  const saleNaira = product.salePrice ? product.salePrice / 100 : null;

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description,

    price: priceNaira,
    salePrice: saleNaira,
    isOnSale: saleNaira !== null && saleNaira < priceNaira,

    isNew: product.isNew,

    images: normalizeImages(product.images),

    variants: product.variants.map((v) => ({
      id: v.id,
      size: v.size,
      color: v.color,
      stock: v.stock,
    })),

    sizes: [...new Set(product.variants.map((v) => v.size).filter(Boolean))],

    stock: product.variants.reduce((sum, v) => sum + v.stock, 0),

    reviews: product.reviews,
  };
}

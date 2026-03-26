// File: lib/mappers/product.ts
import { Product } from "@prisma/client";

/* ------------------------------------------------
   Map product for listing (card view)
------------------------------------------------ */
export function mapProductToCard(product: Product & { images?: { url: string }[] }) {
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    price: product.price / 100,
    salePrice: product.salePrice ? product.salePrice / 100 : null,
    images: product.images?.map((img) => ({ url: img.url })) ?? [],
    isNew: product.isNew ?? false,
    isOnSale: product.salePrice != null,
    stock: product.stock,
  };
}

/* ------------------------------------------------
   Map product for detailed view (includes reviews)
------------------------------------------------ */
export function mapProductToDetail(product: Product & {
  images?: { url: string }[];
  reviews?: { id: string; rating: number; comment: string; user: { id: string; name: string } }[];
}) {
  return {
    ...mapProductToCard(product),
    description: product.description ?? "",
    reviews: product.reviews?.map((r) => ({
      id: r.id,
      rating: r.rating,
      comment: r.comment,
      user: { id: r.user.id, name: r.user.name },
    })) ?? [],
  };
}
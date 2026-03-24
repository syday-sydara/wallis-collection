import { Product, ProductImage } from "@prisma/client";
import { ProductCard } from "@/lib/types/product";

export function mapProductToCard(
  product: Product & { images: ProductImage[] }
): ProductCard {
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    price: product.price,
    salePrice: product.salePrice ?? undefined,
    images: product.images.map((img) => ({ url: img.url })),
    stock: product.stock,
    isNew: product.isNew ?? false,
    isOnSale: product.salePrice != null,
  };
}

export function mapProductsToCards(
  products: (Product & { images: ProductImage[] })[]
): ProductCard[] {
  return products.map(mapProductToCard);
}
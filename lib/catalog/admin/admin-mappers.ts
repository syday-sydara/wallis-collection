// lib/catalog/admin/admin-mappers.ts
import type { AdminProductDetail, AdminProductSummary } from "../admin";
import type { ProductWithRelations, ProductVariant, ProductImage } from "../shared/types";

/**
 * Maps Prisma product with variants/images to AdminProductSummary
 */
export function toAdminProductSummary(
  product: Pick<ProductWithRelations, "id" | "name" | "slug" | "basePrice" | "isArchived" | "variants" | "updatedAt">
): AdminProductSummary {
  const stock = product.variants.reduce((sum, v) => sum + v.stock, 0);

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    basePrice: product.basePrice,
    stock,
    isArchived: product.isArchived,
    updatedAt: product.updatedAt
  };
}

/**
 * Maps Prisma product with full relations to AdminProductDetail
 */
export function toAdminProductDetail(
  product: ProductWithRelations
): AdminProductDetail {
  const stock = product.variants.reduce((sum, v) => sum + v.stock, 0);

  const images: { id: string; url: string; alt: string | null; sortOrder: number }[] =
    product.images.map((img: ProductImage) => ({
      id: img.id,
      url: img.url,
      alt: img.alt,
      sortOrder: img.sortOrder
    }));

  const variants: { id: string; name: string; sku: string; price: number; stock: number }[] =
    product.variants.map((v: ProductVariant) => ({
      id: v.id,
      name: v.name,
      sku: v.sku,
      price: v.price,
      stock: v.stock
    }));

  return {
    ...product,
    stock,
    images,
    variants
  };
}
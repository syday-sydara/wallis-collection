// lib/catalog/mappers.ts
import type {
  ProductWithRelations,
  ProductVariant,
  ProductImage,
  RecommendedProduct
} from "./types";

/**
 * Converts a product with variants/images to a storefront card view
 */
export function toProductCardVM(product: ProductWithRelations | RecommendedProduct) {
  const variants = "variants" in product ? product.variants : [];
  const hasVariants = variants.length > 0;

  const minPrice = hasVariants ? Math.min(...variants.map((v) => v.price)) : product.basePrice ?? 0;
  const maxPrice = hasVariants ? Math.max(...variants.map((v) => v.price)) : product.basePrice ?? 0;

  return {
    id: product.id,
    name: product.name,
    minPrice,
    maxPrice,
    inStock: "stock" in product ? product.stock > 0 : true,
    images: product.images
  };
}

/**
 * Converts a full product to admin summary (list view)
 */
export function toAdminProductSummary(
  product: Pick<ProductWithRelations, "id" | "name" | "slug" | "basePrice" | "isArchived" | "variants" | "updatedAt">
) {
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
 * Converts a full product to admin detail (full view)
 */
export function toAdminProductDetail(product: ProductWithRelations) {
  const stock = product.variants.reduce((sum, v) => sum + v.stock, 0);

  const images = product.images.map((img: ProductImage) => ({
    id: img.id,
    url: img.url,
    alt: img.alt,
    sortOrder: img.sortOrder
  }));

  const variants = product.variants.map((v: ProductVariant) => ({
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
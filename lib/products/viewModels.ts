import type {
  ProductWithRelations,
  RecommendedProduct,
  ProductImage,
  ProductVariant
} from "./types";

/* ---------------------------------------------
 * Storefront Card View
 * --------------------------------------------- */
export function toProductCardVM(product: ProductWithRelations | RecommendedProduct) {
  const variants = "variants" in product ? product.variants : [];
  const hasVariants = variants.length > 0;

  const prices = hasVariants ? variants.map(v => v.price) : [product.basePrice ?? 0];
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);

  // Recommended products may not include stock info
  const inStock = hasVariants
    ? variants.some(v => v.stock > 0)
    : true;

  return {
    id: product.id,
    name: product.name,
    minPrice,
    maxPrice,
    inStock,
    images: product.images.map(img => ({
      id: img.id,
      url: img.url,
      alt: img.alt ?? null
    }))
  };
}

/* ---------------------------------------------
 * Admin Product Summary
 * --------------------------------------------- */
export function toAdminProductSummary(
  product: Pick<
    ProductWithRelations,
    "id" | "name" | "slug" | "basePrice" | "isArchived" | "variants" | "updatedAt"
  >
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

/* ---------------------------------------------
 * Admin Product Detail
 * --------------------------------------------- */
export function toAdminProductDetail(product: ProductWithRelations) {
  const stock = product.variants.reduce((sum, v) => sum + v.stock, 0);

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    basePrice: product.basePrice,
    isArchived: product.isArchived,
    updatedAt: product.updatedAt,
    stock,
    images: product.images
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map(img => ({
        id: img.id,
        url: img.url,
        alt: img.alt ?? null,
        sortOrder: img.sortOrder
      })),
    variants: product.variants.map(v => ({
      id: v.id,
      name: v.name,
      sku: v.sku,
      price: v.price,
      stock: v.stock
    }))
  };
}

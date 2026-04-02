import type { ProductWithRelations, RecommendedProduct } from "./types";

export function toProductCardVM(
  product: ProductWithRelations | RecommendedProduct
) {
  const variants = "variants" in product ? product.variants : [];
  const hasVariants = variants.length > 0;

  const minPrice = hasVariants
    ? Math.min(...variants.map((v) => v.price))
    : product.basePrice ?? 0;

  const maxPrice = hasVariants
    ? Math.max(...variants.map((v) => v.price))
    : product.basePrice ?? 0;

  return {
    id: product.id,
    name: product.name,
    minPrice,
    maxPrice,
    inStock: "stock" in product ? product.stock > 0 : true,
    images: product.images
  };
}
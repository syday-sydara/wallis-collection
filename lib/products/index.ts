// ------------------------------
// Types
// ------------------------------
export type {
  AdminProductSummary,
  AdminProductDetail,
  ProductImage,
  ProductVariant,
  ProductWithRelations,
  RecommendedProduct,
  ProductClientVM,
  ProductListParams,
  ProductListResult,
  ProductCardVM,
  ProductDetailVM,
} from "./types";

// ------------------------------
// View Models
// ------------------------------
export {
  toProductCardVM,
  toAdminProductSummary,
  toAdminProductDetail,
} from "./viewModels";

// ------------------------------
// Admin Services
// ------------------------------
export { adminCreateProduct } from "./adminCreateProduct";
export { adminUpdateProduct } from "./adminUpdateProduct";
export { adminGetProduct } from "./adminGetProduct";

// ------------------------------
// Storefront Services
// ------------------------------
export {
  getProductBySlug,
  listProducts,
  getRecommendedProducts,
} from "./service";

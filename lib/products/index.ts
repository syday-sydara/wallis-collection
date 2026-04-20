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
// Storefront Services
// ------------------------------
export {
  getProducts,
  getProductDetailWithRecommendations,
} from "./service";

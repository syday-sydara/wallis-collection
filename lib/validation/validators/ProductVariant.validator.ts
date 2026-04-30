// === AUTO-GENERATED START ===
import { ProductVariantSchema } from "../schemas/ProductVariant.schema";
import { safeParseOrThrow } from "../zod-helpers";

export function validateProductVariant(input) {
  return safeParseOrThrow(ProductVariantSchema, input);
}
// === AUTO-GENERATED END ===

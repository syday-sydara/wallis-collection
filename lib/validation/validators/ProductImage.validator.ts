// === AUTO-GENERATED START ===
import { ProductImageSchema } from "../schemas/ProductImage.schema";
import { safeParseOrThrow } from "../zod-helpers";

export function validateProductImage(input: unknown) {
  return safeParseOrThrow(ProductImageSchema, input);
}
// === AUTO-GENERATED END ===

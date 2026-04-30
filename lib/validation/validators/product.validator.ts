
// === AUTO-GENERATED START ===
import { ProductSchema } from "../schemas/Product.schema";
import { safeParseOrThrow } from "../zod-helpers";

export function validateProduct(input) {
  return safeParseOrThrow(ProductSchema, input);
}
// === AUTO-GENERATED END ===

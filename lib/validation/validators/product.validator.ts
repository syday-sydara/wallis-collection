import { productSchema } from "../schemas/product.schema";
import { safeParseOrThrow } from "../zod-helpers";

export function validateProduct(input: unknown) {
  return safeParseOrThrow(productSchema, input);
}

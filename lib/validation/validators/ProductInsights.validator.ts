// === AUTO-GENERATED START ===
import { ProductInsightsSchema } from "../schemas/ProductInsights.schema";
import { safeParseOrThrow } from "../zod-helpers";

export function validateProductInsights(input) {
  return safeParseOrThrow(ProductInsightsSchema, input);
}
// === AUTO-GENERATED END ===

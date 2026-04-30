// === AUTO-GENERATED START ===
import { CartSchema } from "../schemas/Cart.schema";
import { safeParseOrThrow } from "../zod-helpers";

export function validateCart(input: unknown) {
  return safeParseOrThrow(CartSchema, input);
}
// === AUTO-GENERATED END ===

// === AUTO-GENERATED START ===
import { CartItemSchema } from "../schemas/CartItem.schema";
import { safeParseOrThrow } from "../zod-helpers";

export function validateCartItem(input: unknown) {
  return safeParseOrThrow(CartItemSchema, input);
}
// === AUTO-GENERATED END ===

// === AUTO-GENERATED START ===
import { OrderItemSchema } from "../schemas/OrderItem.schema";
import { safeParseOrThrow } from "../zod-helpers";

export function validateOrderItem(input: unknown) {
  return safeParseOrThrow(OrderItemSchema, input);
}
// === AUTO-GENERATED END ===

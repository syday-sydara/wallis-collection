// === AUTO-GENERATED START ===
import { OrderItemSchema } from "../schemas/OrderItem.schema";
import { safeParseOrThrow } from "../zod-helpers";

export function validateOrderItem(input) {
  return safeParseOrThrow(OrderItemSchema, input);
}
// === AUTO-GENERATED END ===

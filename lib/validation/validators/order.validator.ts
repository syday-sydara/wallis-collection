
// === AUTO-GENERATED START ===
import { OrderSchema } from "../schemas/Order.schema";
import { safeParseOrThrow } from "../zod-helpers";

export function validateOrder(input) {
  return safeParseOrThrow(OrderSchema, input);
}
// === AUTO-GENERATED END ===

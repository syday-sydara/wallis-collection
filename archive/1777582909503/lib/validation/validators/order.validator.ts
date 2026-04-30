// === AUTO-GENERATED START ===
import { OrderSchema } from "../schemas/Order.schema";
import { safeParseOrThrow } from "../zod-helpers";

export function validateOrder(input: unknown) {
  return safeParseOrThrow(OrderSchema, input);
}
// === AUTO-GENERATED END ===

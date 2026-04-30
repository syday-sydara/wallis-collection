import { orderSchema } from "../schemas/order.schema";
import { safeParseOrThrow } from "./zod-helpers";

export function validateOrder(input: unknown) {
  return safeParseOrThrow(orderSchema, input);
}

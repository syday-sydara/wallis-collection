// === AUTO-GENERATED START ===
import { FulfillmentSchema } from "../schemas/Fulfillment.schema";
import { safeParseOrThrow } from "../zod-helpers";

export function validateFulfillment(input) {
  return safeParseOrThrow(FulfillmentSchema, input);
}
// === AUTO-GENERATED END ===

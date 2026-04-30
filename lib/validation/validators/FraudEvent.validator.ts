
// === AUTO-GENERATED START ===
import { FraudEventSchema } from "../schemas/FraudEvent.schema";
import { safeParseOrThrow } from "../zod-helpers";

export function validateFraudEvent(input) {
  return safeParseOrThrow(FraudEventSchema, input);
}
// === AUTO-GENERATED END ===

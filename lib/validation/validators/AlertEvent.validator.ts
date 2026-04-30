// === AUTO-GENERATED START ===
import { AlertEventSchema } from "../schemas/AlertEvent.schema";
import { safeParseOrThrow } from "../zod-helpers";

export function validateAlertEvent(input) {
  return safeParseOrThrow(AlertEventSchema, input);
}
// === AUTO-GENERATED END ===

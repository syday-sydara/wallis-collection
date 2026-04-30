// === AUTO-GENERATED START ===
import { AlertEventSchema } from "../schemas/AlertEvent.schema";
import { safeParseOrThrow } from "../zod-helpers";

export function validateAlertEvent(input: unknown) {
  return safeParseOrThrow(AlertEventSchema, input);
}
// === AUTO-GENERATED END ===

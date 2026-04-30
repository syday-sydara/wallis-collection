
// === AUTO-GENERATED START ===
import { SecurityEventSchema } from "../schemas/SecurityEvent.schema";
import { safeParseOrThrow } from "../zod-helpers";

export function validateSecurityEvent(input) {
  return safeParseOrThrow(SecurityEventSchema, input);
}
// === AUTO-GENERATED END ===

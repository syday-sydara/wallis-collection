
// === AUTO-GENERATED START ===
import { SessionEventSchema } from "../schemas/SessionEvent.schema";
import { safeParseOrThrow } from "../zod-helpers";

export function validateSessionEvent(input) {
  return safeParseOrThrow(SessionEventSchema, input);
}
// === AUTO-GENERATED END ===

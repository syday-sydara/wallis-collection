// === AUTO-GENERATED START ===
import { SessionSchema } from "../schemas/Session.schema";
import { safeParseOrThrow } from "../zod-helpers";

export function validateSession(input) {
  return safeParseOrThrow(SessionSchema, input);
}
// === AUTO-GENERATED END ===

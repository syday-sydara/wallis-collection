
// === AUTO-GENERATED START ===
import { WhatsAppSessionSchema } from "../schemas/WhatsAppSession.schema";
import { safeParseOrThrow } from "../zod-helpers";

export function validateWhatsAppSession(input) {
  return safeParseOrThrow(WhatsAppSessionSchema, input);
}
// === AUTO-GENERATED END ===

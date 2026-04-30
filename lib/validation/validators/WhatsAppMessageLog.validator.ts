// === AUTO-GENERATED START ===
import { WhatsAppMessageLogSchema } from "../schemas/WhatsAppMessageLog.schema";
import { safeParseOrThrow } from "../zod-helpers";

export function validateWhatsAppMessageLog(input: unknown) {
  return safeParseOrThrow(WhatsAppMessageLogSchema, input);
}
// === AUTO-GENERATED END ===

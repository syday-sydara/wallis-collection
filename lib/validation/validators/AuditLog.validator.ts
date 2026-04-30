
// === AUTO-GENERATED START ===
import { AuditLogSchema } from "../schemas/AuditLog.schema";
import { safeParseOrThrow } from "../zod-helpers";

export function validateAuditLog(input) {
  return safeParseOrThrow(AuditLogSchema, input);
}
// === AUTO-GENERATED END ===

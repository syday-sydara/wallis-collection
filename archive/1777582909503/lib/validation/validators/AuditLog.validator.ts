// === AUTO-GENERATED START ===
import { AuditLogSchema } from "../schemas/AuditLog.schema";
import { safeParseOrThrow } from "../zod-helpers";

export function validateAuditLog(input: unknown) {
  return safeParseOrThrow(AuditLogSchema, input);
}
// === AUTO-GENERATED END ===

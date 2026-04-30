// lib/audit/emit.ts

import { emitEvent } from "@/lib/events/emitter";
import type { AuditLogInput } from "./types";

export function emitAuditEvent(input: AuditLogInput) {
  return emitEvent(input);
}

// lib/audit/service.ts
import { logAuditEvent } from "./log";
import { processAlert } from "./alerts";
import type { AuditLogInput } from "./types";

export async function recordAudit(input: AuditLogInput) {
  return logAuditEvent(input);
}

export async function triggerAlert(action: string, metadata?: Record<string, any>) {
  return processAlert({ action, metadata });
}

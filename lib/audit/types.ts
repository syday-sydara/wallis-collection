// lib/audit/types.ts
import type { AuditAction } from "@/lib/events/types";

export type AuditActorType = "USER" | "ADMIN" | "SYSTEM" | "JOB";

export interface AuditLogInput {
  action: AuditAction | string;
  actorType: AuditActorType;
  userId?: string | null;
  resource?: string | null;
  resourceId?: string | null;
  metadata?: Record<string, any>;
}

// lib/audit/types.ts

import type { AuditAction, EventInput, EventMetadata } from "@/lib/events/types";

export type AuditActorType = "USER" | "ADMIN" | "SYSTEM" | "JOB";

export type AuditLogInput = EventInput<
  "audit",
  {
    action: AuditAction;
    actorType: AuditActorType;
    resource?: string | null;
    resourceId?: string | null;
    metadata?: EventMetadata;
  }
>;

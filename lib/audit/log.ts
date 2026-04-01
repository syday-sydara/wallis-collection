// lib/audit/log.ts
import { prisma } from "@/lib/db";

type AuditLogParams = {
  userId?: string | null;
  actorType?: "USER" | "ADMIN" | "SYSTEM" | "JOB";
  action: string;
  resource?: string;
  resourceId?: string;
  ip?: string | null;
  userAgent?: string | null;
  metadata?: Record<string, any>;
};

export async function logAuditEvent(params: AuditLogParams) {
  await prisma.auditEvent.create({
    data: {
      userId: params.userId ?? null,
      actorType: params.actorType ?? "USER",
      action: params.action,
      resource: params.resource,
      resourceId: params.resourceId,
      ip: params.ip ?? undefined,
      userAgent: params.userAgent ?? undefined,
      metadata: params.metadata ?? undefined,
    },
  });
}
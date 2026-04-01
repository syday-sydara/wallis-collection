// lib/events/pipeline.ts
import { prisma } from "@/lib/db";
import type {
  SecurityEventInput,
  AuditEventInput,
  FraudEventInput,
  AlertEventInput
} from "./types";
import { processAlert } from "@/lib/audit/alerts";

export async function logEvent(event:
  | SecurityEventInput
  | AuditEventInput
  | FraudEventInput
  | AlertEventInput
) {
  try {
    switch (event.kind) {
      case "security":
        await prisma.securityEvent.create({
          data: {
            userId: event.userId ?? null,
            type: event.type,
            message: event.message,
            severity: event.severity ?? "low",
            metadata: event.metadata ?? {},
            ip: event.ip ?? null,
            userAgent: event.userAgent ?? null,
          },
        });
        break;

      case "audit":
        await prisma.auditEvent.create({
          data: {
            userId: event.userId ?? null,
            actorType: event.actorType,
            action: event.action,
            resource: event.resource,
            resourceId: event.resourceId,
            metadata: event.metadata ?? {},
            ip: event.ip ?? null,
            userAgent: event.userAgent ?? null,
          },
        });
        break;

      case "fraud":
        await prisma.fraudEvent.create({
          data: {
            orderId: event.orderId ?? null,
            email: event.metadata?.email ?? null,
            ip: event.ip ?? null,
            signal: event.signal,
            metadata: event.metadata ?? {},
          },
        });
        break;

      case "alert":
        await processAlert({
          action: event.event,
          metadata: event.metadata ?? {},
        });
        break;
    }
  } catch (err) {
    console.error("Event pipeline error:", err);
  }
}
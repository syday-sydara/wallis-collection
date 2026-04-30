import { prisma } from "../prisma/client";
import { ActorType } from "@prisma/client";

export const AuditService = {
  async log(input: {
    requestId?: string;
    userId?: string;
    actorType: ActorType;
    action: string;
    entityType: string;
    entityId: string;
    metadata?: Record<string, string | number | boolean | null>;
    ipAddress?: string;
    userAgent?: string;
  }) {
    try {
      await prisma.auditLog.create({
        data: {
          requestId: input.requestId,
          userId: input.userId,
          actorType: input.actorType,
          action: input.action,
          entityType: input.entityType,
          entityId: input.entityId,
          metadata: input.metadata ?? {},
          ipAddress: input.ipAddress,
          userAgent: input.userAgent,
        },
      });
    } catch (err) {
      // ❗ Never block business logic
      console.error("[AUDIT LOG FAILED]", err);

      // optional observability hook
      process.emit?.("audit_log_failed", { err, input });
    }
  },
};
import { prisma } from "../prisma/client";
import { ActorType } from "@prisma/client";
import { redis } from "../redis/client"; // assuming you have this

export const AuditService = {
  async log(input: {
    requestId?: string;
    traceId?: string;
    userId?: string;
    actorType: ActorType;
    action: string;
    entityType: string;
    entityId: string;
    metadata?: Record<string, any>;
    ipAddress?: string;
    userAgent?: string;
  }) {
    const payload = {
      requestId: input.requestId ?? null,
      traceId: input.traceId ?? null,
      userId: input.userId ?? null,
      actorType: input.actorType,
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId,
      metadata: input.metadata ?? {},
      ipAddress: input.ipAddress ?? null,
      userAgent: input.userAgent ?? null,
      createdAt: new Date(),
    };

    try {
      await prisma.auditLog.create({ data: payload });
    } catch (err) {
      console.error("[AUDIT LOG FAILED]", err);

      // fallback durability layer
      try {
        await redis.lpush("audit:failed", JSON.stringify(payload));
      } catch (fallbackErr) {
        console.error("[AUDIT FALLBACK FAILED]", fallbackErr);
      }
    }
  },
};

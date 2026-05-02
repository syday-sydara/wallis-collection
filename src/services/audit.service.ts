// services/audit.service.ts
import { prisma } from "../lib/prisma";
import { ActorType } from "@prisma/client";
import { redis } from "../config/redis";
import { AuditProducer } from "../producers/audit.producer";

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
      // Primary durable store
      const log = await prisma.auditLog.create({ data: payload });

      // Emit event for async processing (idempotent via jobId = logId)
      await AuditProducer.created(log.id);

      return log;
    } catch (err) {
      console.error("[AUDIT LOG FAILED]", err);

      // Fallback durability layer (Redis)
      try {
        await redis.lpush("audit:failed", JSON.stringify(payload));
      } catch (fallbackErr) {
        console.error("[AUDIT FALLBACK FAILED]", fallbackErr);
      }

      return null;
    }
  },
};

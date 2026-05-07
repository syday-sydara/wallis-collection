// lib/audit.ts
import { prisma } from "./prisma";
import { Correlation } from "./correlation";
import { logger } from "./logger";

export const Audit = {
  async write(input: Record<string, any>) {
    return Correlation.withSpan(async () => {
      const ctx = Correlation.get();

      try {
        return await prisma.auditLog.create({
          data: {
            // ------------------------------------------------------
            // User-supplied audit fields
            // ------------------------------------------------------
            ...safeJson(input),

            // ------------------------------------------------------
            // Full correlation context
            // ------------------------------------------------------
            traceId: ctx.traceId,
            requestId: ctx.requestId,
            spanId: ctx.spanId,
            parentSpanId: ctx.parentSpanId ?? null,
            sessionId: ctx.sessionId ?? null,
            orderId: ctx.orderId ?? null,
            customerId: ctx.customerId ?? null,
            workflowId: ctx.workflowId ?? null,
          },
        });
      } catch (err: any) {
        logger.error("Audit log write failed", {
          error: err?.message,
          spanId: ctx.spanId,
          parentSpanId: ctx.parentSpanId,
          workflowId: ctx.workflowId,
        });

        // Audit logging must never break the pipeline
        return null;
      }
    });
  },
};

// ------------------------------------------------------
// Safe JSON serializer (prevents circular structure crashes)
// ------------------------------------------------------
function safeJson(value: any) {
  try {
    return JSON.parse(JSON.stringify(value));
  } catch {
    return { error: "Unserializable audit payload" };
  }
}

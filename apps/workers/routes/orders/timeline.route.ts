// routes/orders/timeline.route.ts
import { Router } from "express";
import { prisma } from "@/lib/prisma";
import { TimelineAggregator } from "@/services/timeline/timeline-aggregator";
import { Correlation } from "@/lib/correlation";
import { logger } from "@/lib/logger";
import { adminAuth } from "@/lib/middleware/admin-auth";

export const orderTimelineRouter = Router();

// ------------------------------------------------------
// Admin‑only protection
// ------------------------------------------------------
orderTimelineRouter.use(adminAuth());

/**
 * GET /orders/:id/timeline
 */
orderTimelineRouter.get("/:id/timeline", async (req, res) => {
  return Correlation.withSpan(async () => {
    const ctx = Correlation.get();
    const orderId = req.params.id;

    try {
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { whatsAppSession: true },
      });

      if (!order) {
        logger.warn("Admin: order not found for timeline", {
          orderId,
          spanId: ctx.spanId,
        });

        return res.status(404).json({ error: "Order not found" });
      }

      const timeline = await TimelineAggregator.getTimeline({
        customerId: order.customerId ?? undefined,
        phone: order.phoneNormalized ?? undefined,
        sessionId: order.whatsAppSessionId ?? undefined,
      });

      logger.info("Admin: fetched order timeline", {
        orderId,
        customerId: order.customerId,
        sessionId: order.whatsAppSessionId,
        spanId: ctx.spanId,
        parentSpanId: ctx.parentSpanId,
      });

      res.json({ orderId, timeline });
    } catch (err: any) {
      logger.error("Admin: order timeline fetch failed", {
        orderId,
        error: err.message,
        spanId: ctx.spanId,
      });

      res.status(500).json({ error: "Failed to load timeline" });
    }
  });
});

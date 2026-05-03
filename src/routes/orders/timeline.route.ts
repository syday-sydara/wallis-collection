// routes/orders/timeline.route.ts
import { Router } from "express";
import { prisma } from "../../lib/prisma";
import { TimelineAggregator } from "../../services/timeline/timeline-aggregator";

export const orderTimelineRouter = Router();

/**
 * GET /orders/:id/timeline
 */
orderTimelineRouter.get("/:id/timeline", async (req, res) => {
  try {
    const orderId = req.params.id;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { whatsAppSession: true },
    });

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    const timeline = await TimelineAggregator.getTimeline({
      customerId: order.customerId ?? undefined,
      phone: order.phoneNormalized ?? undefined,
      sessionId: order.whatsAppSessionId ?? undefined,
    });

    res.json({ orderId, timeline });
  } catch (err) {
    console.error("[ORDER TIMELINE] Error:", err);
    res.status(500).json({ error: "Failed to load timeline" });
  }
});

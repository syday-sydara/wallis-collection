// routes/customers/timeline.route.ts
import { Router } from "express";
import { TimelineAggregator } from "@/services/timeline/timeline-aggregator";
import { Correlation } from "@/lib/correlation";
import { logger } from "@/lib/logger";
import { adminAuth } from "@/lib/middleware/admin-auth";

export const customerTimelineRouter = Router();

// ------------------------------------------------------
// Admin‑only protection
// ------------------------------------------------------
customerTimelineRouter.use(adminAuth());

/**
 * GET /customers/:id/timeline
 */
customerTimelineRouter.get("/:id/timeline", async (req, res) => {
  return Correlation.withSpan(async () => {
    const ctx = Correlation.get();
    const customerId = req.params.id;

    try {
      const timeline = await TimelineAggregator.getTimeline({
        customerId,
      });

      logger.info("Admin: fetched customer timeline", {
        customerId,
        spanId: ctx.spanId,
        parentSpanId: ctx.parentSpanId,
      });

      res.json({ customerId, timeline });
    } catch (err: any) {
      logger.error("Admin: timeline fetch failed", {
        customerId,
        error: err.message,
        spanId: ctx.spanId,
      });

      res.status(500).json({ error: "Failed to load timeline" });
    }
  });
});

// routes/customers/timeline.route.ts
import { Router } from "express";
import { TimelineAggregator } from "../../services/timeline/timeline-aggregator";

export const customerTimelineRouter = Router();

/**
 * GET /customers/:id/timeline
 */
customerTimelineRouter.get("/:id/timeline", async (req, res) => {
  try {
    const customerId = req.params.id;

    const timeline = await TimelineAggregator.getTimeline({
      customerId,
    });

    res.json({ customerId, timeline });
  } catch (err) {
    console.error("[CUSTOMER TIMELINE] Error:", err);
    res.status(500).json({ error: "Failed to load timeline" });
  }
});

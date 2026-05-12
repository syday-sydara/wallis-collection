// services/timeline.service.ts
import { TimelineIdentityResolver } from "@/services/timeline/identity-resolver";
import { TimelineAggregator } from "@/services/timeline/timeline-aggregator";
import { TimelineCache } from "@/services/timeline/cache";

export class TimelineService {
  /**
   * Unified entry point for timeline retrieval.
   * Guarantees:
   * - identity resolved once
   * - cache key built once
   * - pagination params normalized once
   * - aggregator receives resolved identity only
   */
  static async get(input: {
    customerId?: string;
    phone?: string;
    sessionId?: string;
    cursor?: string;
    reverseCursor?: string;
    limit?: number;
  }) {
    const identity = await TimelineIdentityResolver.resolve(input);

    const pagination = {
      cursor: input.cursor ?? null,
      reverseCursor: input.reverseCursor ?? null,
      limit: input.limit ?? 50,
    };

    // 1. Try cache
    const cached = await TimelineCache.get(identity, pagination);
    if (cached) return cached;

    // 2. Build timeline (aggregator no longer resolves identity)
    const page = await TimelineAggregator.getTimeline({
      identity,
      ...pagination,
    });

    // 3. Cache result
    await TimelineCache.set(identity, pagination, page);

    return page;
  }
}

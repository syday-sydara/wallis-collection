// services/timeline/index.ts
import { TimelineIdentityResolver } from "./identity-resolver";
import { TimelineAggregator } from "./timeline-aggregator";
import { TimelineCache } from "./cache";

export class TimelineService {
  static async get(input: {
    customerId?: string;
    phone?: string;
    sessionId?: string;

    cursor?: string;
    reverseCursor?: string;
    limit?: number;
  }) {
    // ------------------------------------------------------
    // 1. Resolve identity (customerId, phone, sessionId → identity envelope)
    // ------------------------------------------------------
    const identity = await TimelineIdentityResolver.resolve(input);

    if (!identity) {
      return {
        items: [],
        nextCursor: null,
        prevCursor: null,
      };
    }

    const pagination = {
      cursor: input.cursor ?? null,
      reverseCursor: input.reverseCursor ?? null,
      limit: input.limit ?? 50,
    };

    // ------------------------------------------------------
    // 2. Try cache (cursor-aware)
    // ------------------------------------------------------
    const cached = await TimelineCache.get(identity, pagination);

    if (cached) {
      return cached; // already a pagination envelope
    }

    // ------------------------------------------------------
    // 3. Build timeline (sorted, enriched, correlated)
    // ------------------------------------------------------
    const page = await TimelineAggregator.getTimeline({
      identity,
      ...pagination,
    });

    // ------------------------------------------------------
    // 4. Cache the page
    // ------------------------------------------------------
    await TimelineCache.set(identity, pagination, page);

    return page;
  }
}

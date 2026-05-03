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
    // 1. Resolve identity
    // ------------------------------------------------------
    const identity = await TimelineIdentityResolver.resolve(input);

    // ------------------------------------------------------
    // 2. Try cache (cursor-aware)
    // ------------------------------------------------------
    const cached = await TimelineCache.get(identity, {
      cursor: input.cursor,
      reverseCursor: input.reverseCursor,
    });

    if (cached) {
      return cached; // already a pagination envelope
    }

    // ------------------------------------------------------
    // 3. Build timeline (already sorted)
    // ------------------------------------------------------
    const page = await TimelineAggregator.getTimeline(input);

    // ------------------------------------------------------
    // 4. Cache the page
    // ------------------------------------------------------
    await TimelineCache.set(identity, {
      cursor: input.cursor,
      reverseCursor: input.reverseCursor,
    }, page);

    return page;
  }
}

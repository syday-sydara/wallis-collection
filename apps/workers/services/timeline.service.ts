import { TimelineIdentityResolver } from "./timeline/identity-resolver";
import { TimelineAggregator } from "./timeline/timeline-aggregator";
import { TimelineCache } from "./timeline/cache";

export class TimelineService {
  static async get(input) {
    const identity = await TimelineIdentityResolver.resolve(input);

    const cached = await TimelineCache.get(identity, {
      cursor: input.cursor,
      reverseCursor: input.reverseCursor,
    });

    if (cached) return cached;

    const page = await TimelineAggregator.getTimeline(input);

    await TimelineCache.set(identity, {
      cursor: input.cursor,
      reverseCursor: input.reverseCursor,
    }, page);

    return page;
  }
}

// services/timeline/pagination.ts
import type { TimelineEntry } from "../../domain/timeline";

export class TimelinePagination {
  static paginate(
    entries: TimelineEntry[],
    options: {
      cursor?: string;       // fetch older than this
      reverseCursor?: string; // fetch newer than this
      limit?: number;
    } = {}
  ) {
    const { cursor, reverseCursor, limit = 50 } = options;

    // ------------------------------------------------------
    // Case 1: First page (no cursors)
    // ------------------------------------------------------
    if (!cursor && !reverseCursor) {
      const slice = entries.slice(0, limit);

      return {
        items: slice,
        nextCursor:
          slice.length === limit
            ? slice[slice.length - 1].timestamp.toISOString()
            : null,
        prevCursor: null,
        hasMoreNext: slice.length === limit,
        hasMorePrev: false,
      };
    }

    // ------------------------------------------------------
    // Case 2: Forward pagination (older items)
    // ------------------------------------------------------
    if (cursor) {
      const cursorDate = new Date(cursor);
      if (isNaN(cursorDate.getTime())) throw new Error("Invalid cursor");

      const filtered = entries.filter(e => e.timestamp < cursorDate);
      const slice = filtered.slice(0, limit);

      return {
        items: slice,
        nextCursor:
          slice.length === limit
            ? slice[slice.length - 1].timestamp.toISOString()
            : null,
        prevCursor: cursor, // allows scrolling back up
        hasMoreNext: slice.length === limit,
        hasMorePrev: true,
      };
    }

    // ------------------------------------------------------
    // Case 3: Reverse pagination (newer items)
    // ------------------------------------------------------
    if (reverseCursor) {
      const cursorDate = new Date(reverseCursor);
      if (isNaN(cursorDate.getTime())) throw new Error("Invalid reverseCursor");

      const filtered = entries.filter(e => e.timestamp > cursorDate);
      const slice = filtered.slice(0, limit);

      return {
        items: slice,
        nextCursor: reverseCursor, // allows scrolling back down
        prevCursor:
          slice.length === limit
            ? slice[slice.length - 1].timestamp.toISOString()
            : null,
        hasMoreNext: true,
        hasMorePrev: slice.length === limit,
      };
    }

    throw new Error("Invalid pagination state");
  }
}

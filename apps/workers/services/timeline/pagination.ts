// services/timeline/pagination.ts

export interface PaginationInput {
  cursor: string | null;
  reverseCursor: string | null;
  limit: number;
}

export interface PaginationEnvelope<T> {
  items: T[];
  nextCursor: string | null;
  prevCursor: string | null;
}

/**
 * Cursor-based pagination for timeline entries.
 *
 * Requirements:
 * - Stable ordering (timestamp DESC)
 * - Forward pagination (cursor)
 * - Reverse pagination (reverseCursor)
 * - Symmetric navigation
 * - Deterministic cursors (ISO timestamps)
 */
export class TimelinePagination {
  static paginate<T extends { timestamp: Date }>(
    items: T[],
    input: PaginationInput
  ): PaginationEnvelope<T> {
    const { cursor, reverseCursor, limit } = input;

    // ------------------------------------------------------
    // 1. If reverseCursor is provided → paginate backwards
    // ------------------------------------------------------
    if (reverseCursor) {
      const startIndex = items.findIndex(
        (i) => i.timestamp.toISOString() === reverseCursor
      );

      const sliceStart = Math.max(startIndex - limit, 0);
      const sliceEnd = startIndex;

      const page = items.slice(sliceStart, sliceEnd);

      return {
        items: page,
        nextCursor: page.length ? page[page.length - 1].timestamp.toISOString() : null,
        prevCursor: sliceStart > 0 ? items[sliceStart - 1].timestamp.toISOString() : null,
      };
    }

    // ------------------------------------------------------
    // 2. Forward pagination (cursor)
    // ------------------------------------------------------
    if (cursor) {
      const startIndex = items.findIndex(
        (i) => i.timestamp.toISOString() === cursor
      );

      const sliceStart = startIndex + 1;
      const sliceEnd = sliceStart + limit;

      const page = items.slice(sliceStart, sliceEnd);

      return {
        items: page,
        nextCursor: page.length ? page[page.length - 1].timestamp.toISOString() : null,
        prevCursor: sliceStart > 0 ? items[sliceStart - 1].timestamp.toISOString() : null,
      };
    }

    // ------------------------------------------------------
    // 3. First page (no cursor)
    // ------------------------------------------------------
    const page = items.slice(0, limit);

    return {
      items: page,
      nextCursor: page.length ? page[page.length - 1].timestamp.toISOString() : null,
      prevCursor: null,
    };
  }
}

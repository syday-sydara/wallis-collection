// services/timeline/cache.ts
import { redis } from "../../lib/redis";

export class TimelineCache {
  /**
   * Base identity key (customer or phone or session)
   */
  static identityKey(identity: {
    customerId?: string | null;
    phone?: string | null;
    sessionId?: string | null;
  }) {
    if (identity.customerId) return `timeline:${identity.customerId}`;
    if (identity.phone) return `timeline:phone:${identity.phone}`;
    if (identity.sessionId) return `timeline:session:${identity.sessionId}`;
    return "timeline:unknown";
  }

  /**
   * Cursor-aware cache key
   */
  static pageKey(
    identity: { customerId?: string; phone?: string; sessionId?: string },
    cursor?: string | null,
    reverseCursor?: string | null
  ) {
    const base = this.identityKey(identity);

    if (cursor) return `${base}:cursor:${cursor}`;
    if (reverseCursor) return `${base}:reverse:${reverseCursor}`;

    return `${base}:first`;
  }

  /**
   * Get cached page
   */
  static async get(
    identity: { customerId?: string; phone?: string; sessionId?: string },
    { cursor, reverseCursor }: { cursor?: string | null; reverseCursor?: string | null }
  ) {
    const key = this.pageKey(identity, cursor, reverseCursor);
    const cached = await redis.get(key);
    return cached ? JSON.parse(cached) : null;
  }

  /**
   * Cache a page (pagination envelope)
   */
  static async set(
    identity: { customerId?: string; phone?: string; sessionId?: string },
    { cursor, reverseCursor }: { cursor?: string | null; reverseCursor?: string | null },
    page: any
  ) {
    const key = this.pageKey(identity, cursor, reverseCursor);

    // Nigeria-first TTL: 5 minutes (network jitter, WhatsApp delays)
    await redis.set(key, JSON.stringify(page), "EX", 300);
  }

  /**
   * Invalidate all cached pages for this identity
   */
  static async invalidate(identity: {
    customerId?: string;
    phone?: string;
    sessionId?: string;
  }) {
    const base = this.identityKey(identity);
    const keys = await redis.keys(`${base}*`);

    if (keys.length > 0) {
      await redis.del(...keys);
    }
  }
}

// services/timeline/cache.ts
import { redis } from "../../lib/redis";

export class TimelineCache {
  /**
   * Base identity key (customer or phone)
   */
  static identityKey(identity: {
    customerId?: string | null;
    phoneNormalized?: string | null;
  }) {
    return identity.customerId
      ? `timeline:${identity.customerId}`
      : `timeline:phone:${identity.phoneNormalized}`;
  }

  /**
   * Cursor-aware cache key
   */
  static pageKey(identity, cursor?: string, reverseCursor?: string) {
    const base = this.identityKey(identity);

    if (cursor) return `${base}:cursor:${cursor}`;
    if (reverseCursor) return `${base}:reverse:${reverseCursor}`;

    return `${base}:first`;
  }

  /**
   * Get cached page
   */
  static async get(identity, { cursor, reverseCursor }) {
    const key = this.pageKey(identity, cursor, reverseCursor);
    const cached = await redis.get(key);
    return cached ? JSON.parse(cached) : null;
  }

  /**
   * Cache a page (pagination envelope)
   */
  static async set(identity, { cursor, reverseCursor }, page) {
    const key = this.pageKey(identity, cursor, reverseCursor);
    await redis.set(key, JSON.stringify(page), "EX", 60);
  }

  /**
   * Invalidate all cached pages for this identity
   */
  static async invalidate(identity) {
    const base = this.identityKey(identity);
    const keys = await redis.keys(`${base}*`);
    if (keys
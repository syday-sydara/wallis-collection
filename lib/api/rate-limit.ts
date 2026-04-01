// lib/api/rate-limit.ts

const WINDOW_MS = 60_000; // 1 minute
const MAX_REQUESTS = 10;

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

/**
 * Simple in-memory rate limiter.
 * Tracks requests per key and enforces a sliding window.
 *
 * @returns {
 *   allowed: boolean;
 *   remaining: number;
 *   retryAfter: number; // seconds
 * }
 */
export function checkRateLimit(key: string) {
  const now = Date.now();
  const entry = store.get(key);

  // First request or window expired → reset
  if (!entry || entry.resetAt <= now) {
    const resetAt = now + WINDOW_MS;
    store.set(key, { count: 1, resetAt });

    return {
      allowed: true,
      remaining: MAX_REQUESTS - 1,
      retryAfter: 0
    };
  }

  // Too many requests → block
  if (entry.count >= MAX_REQUESTS) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000);

    return {
      allowed: false,
      remaining: 0,
      retryAfter
    };
  }

  // Increment and allow
  entry.count += 1;

  return {
    allowed: true,
    remaining: MAX_REQUESTS - entry.count,
    retryAfter: 0
  };
}

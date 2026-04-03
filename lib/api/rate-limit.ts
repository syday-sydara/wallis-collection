// lib/api/rate-limit.ts
const WINDOW_MS = 60_000; // 1 minute
const MAX_REQUESTS = 10;

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(key: string, max = 10, windowMs = 60000) {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || entry.resetAt < now) {
    const resetAt = now + windowMs;
    store.set(key, { count: 1, resetAt });

    return {
      allowed: true,
      remaining: max - 1,
      retryAfter: 0,
      resetAt,
    };
  }

  if (entry.count >= max) {
    return {
      allowed: false,
      remaining: 0,
      retryAfter: Math.ceil((entry.resetAt - now) / 1000),
      resetAt: entry.resetAt,
    };
  }

  entry.count++;

  return {
    allowed: true,
    remaining: max - entry.count,
    retryAfter: 0,
    resetAt: entry.resetAt,
  };
}
// lib/rate-limit.ts

const WINDOW_MS = 60_000; // 1 minute
const MAX_REQUESTS = 10;

const store = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(key: string) {
  const now = Date.now();
  const existing = store.get(key);

  if (!existing || existing.resetAt < now) {
    store.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true, remaining: MAX_REQUESTS - 1, retryAfter: 0 };
  }

  if (existing.count >= MAX_REQUESTS) {
    const retryAfter = Math.ceil((existing.resetAt - now) / 1000); // in seconds
    return { allowed: false, remaining: 0, retryAfter };
  }

  existing.count += 1;
  return { allowed: true, remaining: MAX_REQUESTS - existing.count, retryAfter: 0 };
}
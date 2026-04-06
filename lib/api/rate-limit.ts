// lib/rate-limit.ts

const DEFAULT_WINDOW_MS = 60_000;
const DEFAULT_MAX = 10;

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();
const MAX_KEYS = 50_000;

/* Cleanup */
export function cleanupRateLimitStore() {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    if (entry.resetAt <= now) {
      store.delete(key);
    }
  }
}

/* Core limiter */
export function checkRateLimit(
  key: string,
  max = DEFAULT_MAX,
  windowMs = DEFAULT_WINDOW_MS,
  options?: {
    namespace?: string;
    jitter?: boolean;
    log?: boolean;
  }
) {
  const { namespace, jitter = true, log = false } = options ?? {};

  // Normalize key
  const safeKey = key.replace(/\s+/g, "_").toLowerCase();
  const fullKey = namespace ? `${namespace}:${safeKey}` : safeKey;

  const now = Date.now();
  const entry = store.get(fullKey);

  // Jitter to avoid synchronized resets
  const resetAt =
    entry?.resetAt && entry.resetAt > now
      ? entry.resetAt
      : now + windowMs + (jitter ? Math.floor(Math.random() * 200) : 0);

  // New window
  if (!entry || entry.resetAt <= now) {
    if (store.size > MAX_KEYS) store.clear();

    store.set(fullKey, { count: 1, resetAt });

    if (log) console.debug(`[RateLimit] ${fullKey} allowed 1/${max}`);

    return {
      allowed: true,
      remaining: max - 1,
      retryAfter: 0,
      resetAt,
    };
  }

  // Exceeded
  if (entry.count >= max) {
    const retryAfter = Math.max(0, Math.ceil((entry.resetAt - now) / 1000));

    if (log) console.warn(`[RateLimit] ${fullKey} blocked, retry in ${retryAfter}s`);

    return {
      allowed: false,
      remaining: 0,
      retryAfter,
      resetAt: entry.resetAt,
    };
  }

  // Increment
  const updated = { ...entry, count: entry.count + 1 };
  store.set(fullKey, updated);

  if (log) console.debug(`[RateLimit] ${fullKey} allowed ${updated.count}/${max}`);

  return {
    allowed: true,
    remaining: max - updated.count,
    retryAfter: 0,
    resetAt: updated.resetAt,
  };
}

/* Auto cleanup */
setInterval(() => cleanupRateLimitStore(), 60_000).unref();
// lib/rate-limit.ts

const DEFAULT_WINDOW_MS = 60_000; // 1 minute
const DEFAULT_MAX = 10;

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

/* -------------------------------------------------- */
/* Cleanup old entries periodically to prevent memory leaks */
/* -------------------------------------------------- */
export function cleanupRateLimitStore() {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    if (entry.resetAt <= now) {
      store.delete(key);
    }
  }
}

/* -------------------------------------------------- */
/* Check rate limit */
/* -------------------------------------------------- */
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
  const fullKey = namespace ? `${namespace}:${key}` : key;

  const now = Date.now();
  const entry = store.get(fullKey);

  // Apply a small jitter to prevent synchronized bursts
  const resetAt = entry?.resetAt && entry.resetAt > now
    ? entry.resetAt
    : now + windowMs + (jitter ? Math.floor(Math.random() * 200) : 0);

  if (!entry || entry.resetAt <= now) {
    store.set(fullKey, { count: 1, resetAt });

    if (log) console.debug(`[RateLimit] ${fullKey} allowed 1/${max}`);

    return {
      allowed: true,
      remaining: max - 1,
      retryAfter: 0,
      resetAt,
    };
  }

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

  // Increment count
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

/* -------------------------------------------------- */
/* Optional: Auto cleanup interval (e.g., 1 min) */
/* -------------------------------------------------- */
setInterval(() => cleanupRateLimitStore(), 60_000).unref();
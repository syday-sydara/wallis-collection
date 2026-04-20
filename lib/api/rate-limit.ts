// lib/api/rate-limit.ts

import { redis } from "../redis";
import { emitSecurityEvent, emitAlertEvent } from "../events/emitter";

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
  retryAfter: number;
}

export interface RateLimitOptions {
  max?: number;
  windowMs?: number;
  namespace?: string;
  jitter?: boolean;
  log?: boolean;
  ip?: string | null;
  userId?: string | null;
  route?: string | null;
}

export async function checkRateLimit(
  key: string,
  {
    max = 10,
    windowMs = 60_000,
    namespace = "default",
    jitter = true,
    log = false,
    ip = null,
    userId = null,
    route = null,
  }: RateLimitOptions = {}
): Promise<RateLimitResult> {
  const fullKey = `${namespace}:${key}`;

  const now = Date.now();
  const ttl = Math.floor(windowMs / 1000);

  let count = 0;
  let resetAt = now + windowMs;

  try {
    count = await redis.incr(fullKey);

    if (count === 1) {
      const jitterMs = jitter ? Math.floor(Math.random() * 200) : 0;
      resetAt = now + windowMs + jitterMs;
      await redis.expire(fullKey, ttl);
    } else {
      const ttlRemaining = await redis.ttl(fullKey);
      resetAt = now + ttlRemaining * 1000;
    }
  } catch (err) {
    console.error("Redis rate-limit error:", err);

    return {
      allowed: true,
      remaining: max - 1,
      resetAt,
      retryAfter: 0,
    };
  }

  const allowed = count <= max;
  const remaining = Math.max(0, max - count);
  const retryAfter = allowed ? 0 : Math.ceil((resetAt - now) / 1000);

  /* -------------------------------------------------- */
  /* Security Event Logging                             */
  /* -------------------------------------------------- */
  await emitSecurityEvent({
    type: "RATE_LIMIT_CHECK",
    message: `Rate limit check for ${fullKey}: ${allowed ? "allowed" : "blocked"}`,
    severity: allowed ? "low" : "medium",
    category: "rate_limit",
    ip,
    userId,
    metadata: {
      key: fullKey,
      count,
      max,
      remaining,
      resetAt,
      route,
    },
  });

  /* -------------------------------------------------- */
  /* Abuse Alerts                                        */
  /* -------------------------------------------------- */
  if (!allowed && count === max + 5) {
    await emitAlertEvent({
      event: "RATE_LIMIT_ABUSE",
      ip,
      metadata: {
        key: fullKey,
        count,
        max,
        route,
      },
    });
  }

  return {
    allowed,
    remaining,
    resetAt,
    retryAfter,
  };
}

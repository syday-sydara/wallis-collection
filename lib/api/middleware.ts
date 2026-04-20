// lib/api/middleware.ts

import { NextRequest } from "next/server";
import { checkRateLimit } from "./rate-limit";

export async function rateLimited(
  req: NextRequest,
  key: string,
  options?: {
    max?: number;
    windowMs?: number;
    namespace?: string;
    log?: boolean;
  }
) {
  const {
    max = 10,
    windowMs = 60_000, // already ms
    namespace = "default",
    log = false,
  } = options ?? {};

  /* -------------------------------------------------- */
  /* Robust IP extraction                                */
  /* -------------------------------------------------- */
  const ip =
    req.headers.get("cf-connecting-ip") ||
    req.headers.get("x-real-ip") ||
    req.headers.get("x-client-ip") ||
    req.headers.get("forwarded")?.split(",")[0] ||
    req.headers.get("x-forwarded-for")?.split(",")[0] ||
    req.ip ||
    null;

  if (!ip) {
    // safer fallback: skip rate limiting instead of grouping all "unknown"
    return { allowed: true, headers: {}, remaining: max, resetAt: Date.now() + windowMs };
  }

  const cleanIp = ip.trim().replace(/:\d+$/, "");

  const fullKey = `${namespace}:${key}:${cleanIp}`;

  /* -------------------------------------------------- */
  /* Rate limit check                                    */
  /* -------------------------------------------------- */
  const result = await checkRateLimit(fullKey, {
    max,
    windowMs, // FIXED: no *1000
    log,
  });

  const headers = {
    "X-RateLimit-Limit": String(max),
    "X-RateLimit-Remaining": String(result.remaining),
    "X-RateLimit-Reset": String(Math.floor(result.resetAt / 1000)),
    "Retry-After": String(result.retryAfter),
  };

  if (!result.allowed) {
    return {
      allowed: false,
      response: new Response(JSON.stringify({ error: "Rate limit exceeded" }), {
        status: 429,
        headers,
      }),
      headers,
      remaining: result.remaining,
      resetAt: result.resetAt,
    };
  }

  return {
    allowed: true,
    headers,
    remaining: result.remaining,
    resetAt: result.resetAt,
  };
}

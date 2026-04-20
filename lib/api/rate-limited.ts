// lib/api/rate-limited.ts

import { NextRequest } from "next/server";
import { checkRateLimit } from "./rate-limit";

export interface RateLimitedOptions {
  max?: number;
  windowMs?: number;
  namespace?: string;
  log?: boolean;
  route?: string;
  userId?: string | null;
}

export async function rateLimited(
  req: NextRequest,
  key: string,
  options?: RateLimitedOptions
) {
  const {
    max = 10,
    windowMs = 60_000,
    namespace = "default",
    log = false,
    route = null,
    userId = null,
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
    // safer fallback: skip rate limiting
    return {
      allowed: true,
      headers: {},
      remaining: max,
      resetAt: Date.now() + windowMs,
    };
  }

  const cleanIp = ip.trim().replace(/:\d+$/, "");

  /* -------------------------------------------------- */
  /* Rate limit check                                    */
  /* -------------------------------------------------- */
  const result = await checkRateLimit(`${key}:${cleanIp}`, {
    max,
    windowMs,
    namespace,
    log,
    ip: cleanIp,
    userId,
    route,
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
      response: new Response(
        JSON.stringify({
          success: false,
          error: "Rate limit exceeded",
        }),
        {
          status: 429,
          headers,
        }
      ),
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

// lib/api/middleware.ts

import { NextRequest } from "next/server";
import { checkRateLimit } from "@/lib/api/rate-limit";

export function rateLimited(
  req: NextRequest,
  key: string,
  options?: {
    max?: number;
    windowMs?: number;
    namespace?: string;
    log?: boolean;
  }
) {
  const { max = 10, windowMs = 60_000, namespace = "default", log = false } =
    options ?? {};

  /* -------------------------------------------------- */
  /* Robust IP extraction                                */
  /* -------------------------------------------------- */
  const forwarded = req.headers.get("x-forwarded-for");
  const rawIp = forwarded?.split(",")[0] || req.ip || "unknown";

  // Strip IPv6 port suffix
  const ip = rawIp.trim().replace(/:\d+$/, "");

  const fullKey = `${namespace}:${key}:${ip}`;

  /* -------------------------------------------------- */
  /* Rate limit check                                    */
  /* -------------------------------------------------- */
  const result = checkRateLimit(fullKey, max, windowMs, { log });

  const headers = {
    "X-RateLimit-Limit": max.toString(),
    "X-RateLimit-Remaining": result.remaining.toString(),
    "X-RateLimit-Reset": Math.floor(result.resetAt / 1000).toString(),
    "Retry-After": result.retryAfter.toString(),
  };

  if (!result.allowed) {
    return new Response(
      JSON.stringify({ error: "Rate limit exceeded" }),
      {
        status: 429,
        headers,
      }
    );
  }

  return {
    allowed: true,
    headers,
    remaining: result.remaining,
    resetAt: result.resetAt,
  };
}

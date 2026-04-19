// lib/api/rate-limited.ts

import { NextRequest } from "next/server";
import { checkRateLimit } from "@/lib/api/rate-limit";

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
  const forwarded = req.headers.get("x-forwarded-for");
  const rawIp = forwarded?.split(",")[0] ?? "unknown";
  const ip = rawIp.trim().replace(/:\d+$/, "");

  /* -------------------------------------------------- */
  /* Rate limit check                                    */
  /* -------------------------------------------------- */
  const result = await checkRateLimit(`${namespace}:${key}:${ip}`, {
    max,
    windowMs,
    namespace,
    log,
    ip,
    userId,
    route,
  });

  const headers = {
    "X-RateLimit-Limit": max.toString(),
    "X-RateLimit-Remaining": result.remaining.toString(),
    "X-RateLimit-Reset": Math.floor(result.resetAt / 1000).toString(),
    "Retry-After": result.retryAfter.toString(),
  };

  if (!result.allowed) {
    return new Response(
      JSON.stringify({
        success: false,
        error: "Rate limit exceeded",
      }),
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

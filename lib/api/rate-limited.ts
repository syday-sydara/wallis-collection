import { NextRequest } from "next/server";
import { checkRateLimit } from "./rate-limit";

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
  const { max = 10, windowMs = 60_000, namespace, log = false } = options ?? {};

  // Normalize IP
  const forwarded = req.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0].trim() || req.ip || "unknown";

  const fullKey = `${namespace ?? "default"}:${key}:${ip}`;

  // Forward log option to the underlying limiter
  const result = checkRateLimit(fullKey, max, windowMs, { log });

  const headers = {
    "X-RateLimit-Limit": max.toString(),
    "X-RateLimit-Remaining": result.remaining.toString(),
    "X-RateLimit-Reset": Math.floor(result.resetAt / 1000).toString(),
  };

  if (!result.allowed) {
    return new Response(
      JSON.stringify({ error: "Rate limit exceeded" }),
      {
        status: 429,
        headers: {
          ...headers,
          "Retry-After": result.retryAfter.toString(),
        },
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
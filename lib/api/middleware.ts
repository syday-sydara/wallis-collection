// lib/rate-limit/middleware.ts
import { NextRequest } from "next/server";
import { checkRateLimit } from "./rate-limit";
import { tooManyRequests } from "./response";

export interface RateLimitOptions {
  max?: number;
  windowMs?: number;
  namespace?: string;
  log?: boolean;
}

export interface RateLimitResult {
  allowed: boolean;
  headers: Record<string, string>;
  remaining: number;
  resetAt: number;
}

/**
 * Rate-limit a request by IP and optional namespace/key.
 * Returns a JSON 429 response if limit exceeded.
 */
export function rateLimited(
  req: NextRequest,
  key: string,
  options?: RateLimitOptions
): RateLimitResult | Response {
  const { max = 10, windowMs = 60_000, namespace, log = false } = options ?? {};

  // Detect IP robustly
  const forwarded = req.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0].trim() || req.ip || "unknown";

  const fullKey = `${namespace ?? "default"}:${key}:${ip}`;

  // Check limit
  const result = checkRateLimit(fullKey, max, windowMs, { log });

  // Set standard rate-limit headers
  const headers = {
    "X-RateLimit-Limit": max.toString(),
    "X-RateLimit-Remaining": result.remaining.toString(),
    "X-RateLimit-Reset": Math.floor(result.resetAt / 1000).toString(),
  };

  // Deny if exceeded
  if (!result.allowed) {
    return tooManyRequests(
      "Rate limit exceeded",
      undefined,
      result.retryAfter,
      { headers }
    );
  }

  return {
    allowed: true,
    headers,
    remaining: result.remaining,
    resetAt: result.resetAt,
  };
}
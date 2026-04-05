// lib/rate-limit/middleware.ts
import { NextRequest } from "next/server";
import { checkRateLimit } from "./rate-limit";
import { tooManyRequests } from "./response";

export interface RateLimitOptions {
  max?: number;
  windowMs?: number;
  namespace?: string;
  log?: boolean;
  keyOverride?: string;
}

export interface RateLimitResult {
  allowed: boolean;
  headers: Record<string, string>;
  remaining: number;
  resetAt: number;
}

export function rateLimited(
  req: NextRequest,
  key: string,
  options?: RateLimitOptions
): RateLimitResult | Response {
  const { max = 10, windowMs = 60_000, namespace = "default", log = false, keyOverride } =
    options ?? {};

  // Robust IP extraction
  const forwarded = req.headers.get("x-forwarded-for");
  const ip = (forwarded?.split(",")[0] || req.ip || "unknown")
    .trim()
    .replace(/:\d+$/, "");

  const fullKey = `${namespace}:${keyOverride ?? key}:${ip}`;

  const result = checkRateLimit(fullKey, max, windowMs, { log });

  const headers = {
    "X-RateLimit-Limit": max.toString(),
    "X-RateLimit-Remaining": result.remaining.toString(),
    "X-RateLimit-Reset": Math.floor(result.resetAt / 1000).toString(),
  };

  if (!result.allowed) {
    return tooManyRequests("Rate limit exceeded", undefined, result.retryAfter, {
      headers,
    });
  }

  return {
    allowed: true,
    headers,
    remaining: result.remaining,
    resetAt: result.resetAt,
  };
}
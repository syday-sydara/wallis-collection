// lib/api/rate-limited.ts
import { NextRequest } from "next/server";
import { checkRateLimit } from "./rate-limit";
import { tooManyRequests } from "./response";

export function rateLimited(req: NextRequest, key: string) {
  const result = checkRateLimit(key);

  const headers = {
    "X-RateLimit-Limit": "10",
    "X-RateLimit-Remaining": result.remaining.toString(),
    "X-RateLimit-Reset": Math.floor(result.resetAt / 1000).toString(),
  };

  if (!result.allowed) {
    return tooManyRequests("Rate limit exceeded").headers(headers);
  }

  return { allowed: true, headers };
}
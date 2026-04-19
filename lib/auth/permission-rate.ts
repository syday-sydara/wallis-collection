// lib/auth/permission-rate.ts
import { redis } from "@/lib/redis";

const WINDOW_SECONDS = 10 * 60; // 10 minutes
const MAX = 20;

function normalizeIp(ip: string): string {
  if (!ip) return "unknown";

  // Take first forwarded IP
  let clean = ip.split(",")[0].trim();

  // Remove port if present
  clean = clean.replace(/:\d+$/, "");

  // Normalize IPv6 localhost
  if (clean === "::1") return "127.0.0.1";

  // IPv4-mapped IPv6 (e.g., ::ffff:192.168.0.1)
  const ipv4Match = clean.match(/::ffff:(\d+\.\d+\.\d+\.\d+)/);
  if (ipv4Match) return ipv4Match[1];

  // Prevent Redis key injection
  clean = clean.replace(/[^a-zA-Z0-9\.\:]/g, "");

  return clean || "unknown";
}

/**
 * Tracks permission-denied attempts per IP.
 * Returns { allowed, count, resetAt }.
 */
export async function trackPermissionDenied(ip: string) {
  const normalized = normalizeIp(ip);
  const key = `perm:denied:${normalized}`;

  try {
    // Use pipeline for performance
    const pipeline = redis.pipeline();
    pipeline.incr(key);
    pipeline.expire(key, WINDOW_SECONDS);
    const results = await pipeline.exec();

    const count = Number(results?.[0]?.[1] ?? 1);

    // Safety cap: if Redis returns something absurd
    const safeCount = Number.isFinite(count) ? count : MAX + 1;

    const allowed = safeCount <= MAX;

    return {
      allowed,
      count: safeCount,
      resetAt: Date.now() + WINDOW_SECONDS * 1000,
    };
  } catch (err) {
    console.error("Redis unavailable for permission rate-limit:", err);

    // Fail-open: allow but still track
    return {
      allowed: true,
      count: 1,
      resetAt: Date.now() + WINDOW_SECONDS * 1000,
    };
  }
}

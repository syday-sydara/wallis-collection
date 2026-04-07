// lib/auth/permission-rate.ts

import { redis } from "@/lib/redis";

const WINDOW_SECONDS = 10 * 60; // 10 minutes
const MAX = 20;

function normalizeIp(ip: string): string {
  return ip.split(",")[0].trim();
}

/**
 * Tracks permission-denied attempts per IP.
 * Returns { allowed, count, resetAt }.
 */
export async function trackPermissionDenied(ip: string) {
  const normalized = normalizeIp(ip);
  const key = `perm:denied:${normalized}`;

  try {
    const count = await redis.incr(key);

    if (count === 1) {
      await redis.expire(key, WINDOW_SECONDS);
    }

    const allowed = count <= MAX;

    return {
      allowed,
      count,
      resetAt: Date.now() + WINDOW_SECONDS * 1000,
    };
  } catch (err) {
    console.error("Redis unavailable for permission rate-limit:", err);

    return {
      allowed: true,
      count: 1,
      resetAt: Date.now() + WINDOW_SECONDS * 1000,
    };
  }
}

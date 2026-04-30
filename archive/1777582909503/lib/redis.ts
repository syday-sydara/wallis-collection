// lib/redis.ts
import { env } from "@/lib/env";
import { Redis } from "@upstash/redis";

const PREFIX = "wallis";

export const redis = Object.freeze(
  new Redis({
    url: env.UPSTASH_REDIS_REST_URL!,
    token: env.UPSTASH_REDIS_REST_TOKEN!,
  }),
);

export function redisKey(...parts: string[]) {
  return [PREFIX, ...parts].join(":");
}

export async function redisSafe<T>(
  fn: () => Promise<T>,
  fallback: T,
): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    console.error("Redis error:", err);
    return fallback;
  }
}

/**
 * Typed safe GET with fallback.
 * Ensures callers never deal with null/undefined surprises.
 */
export async function redisGet<T>(key: string, fallback: T): Promise<T> {
  return redisSafe(async () => {
    const value = await redis.get<T>(key);
    return value ?? fallback;
  }, fallback);
}

/**
 * Typed SET with TTL (seconds).
 * Ensures consistent TTL usage across the system.
 */
export async function redisSetTTL<T>(
  key: string,
  value: T,
  ttlSeconds: number,
): Promise<boolean> {
  return redisSafe(async () => {
    await redis.set(key, value, { ex: ttlSeconds });
    return true;
  }, false);
}

export async function redisHealth() {
  try {
    await redis.ping();
    return true;
  } catch {
    return false;
  }
}

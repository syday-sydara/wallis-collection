// lib/redis.ts
import { env } from "@/lib/env";
import { Redis } from "@upstash/redis";

const PREFIX = "wallis";

export const redis = Object.freeze(
  new Redis({
    url: env.UPSTASH_REDIS_REST_URL!,
    token: env.UPSTASH_REDIS_REST_TOKEN!,
  })
);

export function redisKey(...parts: string[]) {
  return [PREFIX, ...parts].join(":");
}

export async function redisSafe<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    console.error("Redis error:", err);
    return fallback;
  }
}

export async function redisHealth() {
  try {
    await redis.ping();
    return true;
  } catch {
    return false;
  }
}

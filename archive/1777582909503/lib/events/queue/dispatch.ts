// lib/events/queue/dispatch.ts

import { redis, redisKey } from "@/lib/redis";

const QUEUE_KEY = redisKey("events", "queue");

export async function enqueueEvent(event: any) {
  try {
    await redis.rpush(QUEUE_KEY, JSON.stringify(event));
  } catch (err) {
    console.error("[events] Failed to enqueue event:", err);
  }
}

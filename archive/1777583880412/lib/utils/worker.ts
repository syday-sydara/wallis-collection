// lib/events/queue/worker.ts

import { redis, redisKey } from "@/lib/redis";
import { logEvent } from "@/lib/events/pipeline";

const QUEUE_KEY = redisKey("events", "queue");

let started = false;

export async function startQueueWorker() {
  if (started) return;
  started = true;

  console.log("[events] Redis worker started");

  while (true) {
    try {
      // BLPOP is not supported in Upstash REST
      // So we simulate blocking with polling
      const raw = await redis.lpop(QUEUE_KEY);

      if (!raw) {
        await new Promise((r) => setTimeout(r, 200));
        continue;
      }

      const event = JSON.parse(raw);

      try {
        await logEvent(event);
      } catch (err) {
        console.error("[events] Failed to process event:", err);

        // Optional retry:
        // await redis.rpush(QUEUE_KEY, raw);
      }
    } catch (err) {
      console.error("[events] Worker error:", err);
      await new Promise((r) => setTimeout(r, 500));
    }
  }
}

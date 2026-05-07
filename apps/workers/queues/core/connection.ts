// queues/core/connection.ts
import { Redis } from "ioredis";
import { logger } from "@/lib/logger";
import { Correlation } from "@/lib/correlation";
import { metrics } from "@/lib/metrics";

// ---------------------------------------------------------
// Base Redis config (Nigeria‑first reliability)
// ---------------------------------------------------------
const baseConfig = {
  host: process.env.REDIS_HOST ?? "127.0.0.1",
  port: Number(process.env.REDIS_PORT ?? 6379),
  password: process.env.REDIS_PASSWORD ?? undefined,

  maxRetriesPerRequest: null,
  enableReadyCheck: false,

  retryStrategy: (times: number) => Math.min(times * 50, 2000),

  reconnectOnError: (err: Error) => {
    const transient = ["READONLY", "ETIMEDOUT", "ECONNRESET", "EAI_AGAIN"];
    return transient.some((msg) => err.message.includes(msg));
  },
};

// ---------------------------------------------------------
// Shared Redis connection for all BullMQ queues
// ---------------------------------------------------------
export const redis = new Redis(baseConfig);

// ---------------------------------------------------------
// Lifecycle logging (correlation‑aware)
// ---------------------------------------------------------
redis.on("connect", () => {
  const ctx = Correlation.get();
  logger.info("[REDIS] Queue connection established", { ...ctx });
  metrics.increment("redis.queue.connect");
});

redis.on("error", (err) => {
  const ctx = Correlation.get();
  logger.error("[REDIS] Queue connection error", {
    ...ctx,
    error: err.message,
  });
  metrics.increment("redis.queue.error");
});

redis.on("reconnecting", () => {
  const ctx = Correlation.get();
  logger.warn("[REDIS] Queue reconnecting", { ...ctx });
  metrics.increment("redis.queue.reconnect");
});

redis.on("close", () => {
  const ctx = Correlation.get();
  logger.warn("[REDIS] Queue connection closed", { ...ctx });
  metrics.increment("redis.queue.close");
});

// ---------------------------------------------------------
// Graceful shutdown
// ---------------------------------------------------------
export async function shutdownQueueConnection() {
  const ctx = Correlation.get();

  try {
    logger.info("[REDIS] Closing queue connection...", { ...ctx });
    await redis.quit();
    logger.info("[REDIS] Queue connection closed gracefully", { ...ctx });
    metrics.increment("redis.queue.shutdown");
  } catch (err: any) {
    logger.error("[REDIS] Error during shutdown", {
      ...ctx,
      error: err.message,
    });
    metrics.increment("redis.queue.shutdown_error");
  }
}

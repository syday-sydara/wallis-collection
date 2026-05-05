// queues/core/connection.ts
import { Redis } from "ioredis";
import { logger } from "../../lib/logger";

// ---------------------------------------------
// Shared Redis connection for all BullMQ queues
// ---------------------------------------------
export const redis = new Redis({
  host: process.env.REDIS_HOST ?? "127.0.0.1",
  port: Number(process.env.REDIS_PORT ?? 6379),
  password: process.env.REDIS_PASSWORD ?? undefined,
  maxRetriesPerRequest: null, // BullMQ requirement
  enableReadyCheck: false,
});

// ---------------------------------------------
// Connection lifecycle logging
// ---------------------------------------------
redis.on("connect", () => {
  logger.info("[REDIS] Queue connection established");
});

redis.on("error", (err) => {
  logger.error("[REDIS] Queue connection error", { error: err.message });
});

redis.on("close", () => {
  logger.warn("[REDIS] Queue connection closed");
});

// ---------------------------------------------
// Graceful shutdown
// ---------------------------------------------
export async function shutdownQueueConnection() {
  try {
    await redis.quit();
    logger.info("[REDIS] Queue connection closed gracefully");
  } catch (err: any) {
    logger.error("[REDIS] Error during shutdown", { error: err.message });
  }
}

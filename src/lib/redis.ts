// lib/redis.ts
import { Redis } from "ioredis";
import { logger } from "./logger";
import { Correlation } from "./correlation";
import { metrics } from "./metrics";

const baseConfig = {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,

  retryStrategy: (times: number) => {
    // Nigeria‑first exponential backoff with jitter
    const base = times * 50;
    const jitter = Math.random() * 25;
    return Math.min(base + jitter, 2000);
  },

  reconnectOnError: (err: Error) => {
    const transient = ["READONLY", "ETIMEDOUT", "ECONNRESET", "EAI_AGAIN"];
    return transient.some((msg) => err.message.includes(msg));
  },
};

export const redis = new Redis(process.env.REDIS_URL!, baseConfig);

// ---------------------------------------------------------
// Connection event logging + metrics (correlation‑aware)
// ---------------------------------------------------------
redis.on("connect", () => {
  const ctx = Correlation.get();

  logger.info("Redis connected", { ...ctx });
  metrics.increment("redis_connect_total");
});

redis.on("reconnecting", () => {
  Correlation.withSpan(() => {
    const ctx = Correlation.get();

    logger.warn("Redis reconnecting", { ...ctx });
    metrics.increment("redis_reconnect_total");
  });
});

redis.on("error", (err) => {
  const ctx = Correlation.get();

  logger.error("Redis error", { ...ctx, error: err.message });
  metrics.increment("redis_error_total", { code: err?.code });
});

// ---------------------------------------------------------
// Graceful shutdown
// ---------------------------------------------------------
export async function shutdownRedis() {
  const ctx = Correlation.get();

  logger.info("Shutting down Redis", { ...ctx });
  metrics.increment("redis_shutdown_total");

  await redis.quit();
}

import { Redis } from "ioredis";

/**
 * Base Redis configuration
 * Nigeria‑first reliability:
 * - No ready check (DNS flakiness)
 * - Unlimited retries for BullMQ
 * - Exponential backoff capped at 2s
 * - Transient network error reconnects
 */
const baseConfig = {
  host: process.env.REDIS_HOST || "localhost",
  port: Number(process.env.REDIS_PORT) || 6379,
  password: process.env.REDIS_PASSWORD || undefined,

  maxRetriesPerRequest: null,
  enableReadyCheck: false,

  retryStrategy: (times: number) => Math.min(times * 50, 2000),

  reconnectOnError: (err: Error) => {
    const transient = ["READONLY", "ETIMEDOUT", "ECONNRESET", "EAI_AGAIN"];
    return transient.some((msg) => err.message.includes(msg));
  },

  keyPrefix: "store:",
};

/**
 * Primary Redis client
 * Used for:
 * - idempotency keys
 * - reservation locks
 * - rate limiting
 * - caching
 */
export const redis = new Redis(baseConfig);

/**
 * BullMQ connection
 * MUST NOT use keyPrefix
 */
export const connection = new Redis({
  ...baseConfig,
  keyPrefix: undefined,
});

/**
 * Pub/Sub clients
 * MUST NOT use keyPrefix
 */
export const pub = new Redis({ ...baseConfig, keyPrefix: undefined });
export const sub = new Redis({ ...baseConfig, keyPrefix: undefined });

/**
 * Centralized key builder
 * Prevents key collisions and string duplication
 */
export const keys = {
  reservation: (id: string) => `reservation:${id}`,
  lock: (id: string) => `lock:${id}`,
  rateLimit: (phone: string) => `ratelimit:${phone}`,
  session: (id: string) => `session:${id}`,
};

/**
 * Redis health check
 * Used by workers and ops dashboards
 */
export async function redisHealthCheck() {
  try {
    const start = Date.now();
    await redis.ping();
    return { ok: true, latency: Date.now() - start };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
}

/**
 * Safe Redis wrapper
 * For non‑critical Redis operations
 * (rate limiting, caching, analytics)
 */
export async function safeRedis<T>(fn: () => Promise<T>, fallback: T) {
  try {
    return await fn();
  } catch {
    return fallback;
  }
}

/**
 * Graceful shutdown
 * Prevents zombie connections in workers & dev
 */
export async function shutdownRedis() {
  await Promise.all([
    redis.quit(),
    connection.quit(),
    pub.quit(),
    sub.quit(),
  ]);
}

/**
 * Connection event logging
 * Critical for diagnosing Nigeria‑specific network issues
 */
function attachLogging(client: Redis, label: string) {
  client.on("connect", () => console.log(`[REDIS:${label}] connected`));
  client.on("reconnecting", () => console.log(`[REDIS:${label}] reconnecting...`));
  client.on("error", (err) => console.error(`[REDIS:${label}] error`, err));
}

attachLogging(redis, "primary");
attachLogging(connection, "bullmq");
attachLogging(pub, "pub");
attachLogging(sub, "sub");

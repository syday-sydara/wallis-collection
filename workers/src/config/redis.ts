import { Redis } from "ioredis";

const baseConfig = {
  host: process.env.REDIS_HOST || "localhost",
  port: Number(process.env.REDIS_PORT) || 6379,
  password: process.env.REDIS_PASSWORD || undefined,

  maxRetriesPerRequest: null, // required for pub/sub
  enableReadyCheck: false,

  retryStrategy: (times: number) => Math.min(times * 50, 2000),

  reconnectOnError: (err: Error) => {
    const transient = ["READONLY", "ETIMEDOUT", "ECONNRESET", "EAI_AGAIN"];
    return transient.some((msg) => err.message.includes(msg));
  },

  keyPrefix: "store:",
};

// Primary client
export const redis = new Redis(baseConfig);

// Pub/Sub clients (must NOT share same connection)
export const pub = new Redis({ ...baseConfig, keyPrefix: undefined });
export const sub = new Redis({ ...baseConfig, keyPrefix: undefined });

// Graceful shutdown
export async function shutdownRedis() {
  await Promise.all([redis.quit(), pub.quit(), sub.quit()]);
}

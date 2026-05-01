import { Redis } from "ioredis";

const baseConfig = {
  host: process.env.REDIS_HOST || "localhost",
  port: Number(process.env.REDIS_PORT) || 6379,
  password: process.env.REDIS_PASSWORD || undefined,

  maxRetriesPerRequest: null,
  enableReadyCheck: false,

  retryStrategy: (times: number) => {
    return Math.min(times * 50, 2000);
  },

  reconnectOnError: (err: Error) => {
    const targetErrors = [
      "READONLY",
      "ETIMEDOUT",
      "ECONNRESET",
      "EAI_AGAIN",
    ];
    return targetErrors.some((msg) => err.message.includes(msg));
  },

  keyPrefix: "store:",
};

export const redis = new Redis(baseConfig);
export const pub = new Redis(baseConfig);
export const sub = new Redis(baseConfig);

export async function shutdownRedis() {
  await Promise.all([
    redis.quit(),
    pub.quit(),
    sub.quit(),
  ]);
}
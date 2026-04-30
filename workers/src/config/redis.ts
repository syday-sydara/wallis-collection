import { Redis } from "ioredis";

export const connection = new Redis({
  host: process.env.REDIS_HOST || "localhost",
  port: Number(process.env.REDIS_PORT) || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  reconnectOnError: (err) => {
    const targetErrors = ["READONLY", "ETIMEDOUT"];
    return targetErrors.some((msg) => err.message.includes(msg));
  },
});

export const subscriber = connection.duplicate();
export const publisher = connection.duplicate();

export async function checkRedisHealth() {
  try {
    await connection.ping();
    return { healthy: true };
  } catch (err) {
    return { healthy: false, error: err };
  }
}

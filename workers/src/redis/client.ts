// redis/client.ts
import { createClient } from "redis";

const globalForRedis = globalThis as unknown as {
  redis?: ReturnType<typeof createClient>;
};

export const redis =
  globalForRedis.redis ??
  createClient({
    url: process.env.REDIS_URL ?? "redis://localhost:6379",
    socket: {
      reconnectStrategy: retries => {
        // Nigeria‑first reliability: exponential backoff with cap
        return Math.min(retries * 50, 2000);
      },
    },
  });

// Error logging
redis.on("error", err => {
  console.error("[REDIS ERROR]", err);
});

// Safe connect (no top‑level await)
if (!globalForRedis.redis) {
  redis.connect().catch(err => {
    console.error("[REDIS CONNECT ERROR]", err);
  });
}

// Cache client in dev to avoid duplicate connections
if (process.env.NODE_ENV !== "production") {
  globalForRedis.redis = redis;
}

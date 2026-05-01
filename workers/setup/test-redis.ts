import { createClient } from "redis";

export default async function setupTestRedis() {
  const client = createClient({
    url: process.env.REDIS_URL || "redis://localhost:6379",
  });

  await client.connect();
  await client.flushAll();
  await client.quit();
}

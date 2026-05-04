// lib/redis-circuit-store.ts
export class RedisCircuitStore {
  constructor(private redis) {}

  async get(key: string) {
    const raw = await this.redis.get(key);
    if (!raw) return null;

    try {
      return JSON.parse(raw);
    } catch {
      return raw; // fallback for non‑JSON values
    }
  }

  async set(key: string, value: any, ttlMs: number) {
    const serialized =
      typeof value === "string" ? value : JSON.stringify(value);

    await this.redis.set(key, serialized, "PX", ttlMs);
  }

  async del(key: string) {
    await this.redis.del(key);
  }

  async ttl(key: string) {
    return this.redis.pttl(key); // returns ms
  }

  namespaced(name: string) {
    return `circuit:${name}`;
  }
}

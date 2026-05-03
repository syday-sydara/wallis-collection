export class RedisCircuitStore {
  constructor(private redis) {}

  async get(key: string) {
    return this.redis.get(key);
  }

  async set(key: string, value: string, ttlMs: number) {
    await this.redis.set(key, value, "PX", ttlMs);
  }
}

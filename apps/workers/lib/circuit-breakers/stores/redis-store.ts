// lib/circuit-breakers/stores/redis-store.ts
import { Correlation } from "@/lib/correlation";
import { logger } from "@/lib/logger";
import { metrics } from "@/lib/metrics";

export class RedisCircuitStore {
  constructor(private redis: any) {}

  // ------------------------------------------------------
  // Safe GET with correlation + metrics
  // ------------------------------------------------------
  async get(key: string) {
    return Correlation.withSpan(async () => {
      const ctx = Correlation.get();
      const start = Date.now();

      try {
        const raw = await this.redis.get(key);

        metrics.observe("circuit_store_get_latency_ms", Date.now() - start, {
          key,
        });

        if (!raw) return null;

        try {
          return JSON.parse(raw);
        } catch {
          return raw;
        }
      } catch (err: any) {
        logger.error("RedisCircuitStore GET failed", {
          key,
          error: err?.message,
          spanId: ctx.spanId,
          parentSpanId: ctx.parentSpanId,
        });

        metrics.increment("circuit_store_get_error_total", { key });

        return null;
      }
    });
  }

  // ------------------------------------------------------
  // Safe SET with correlation + metrics
  // ------------------------------------------------------
  async set(key: string, value: any, ttlMs: number) {
    return Correlation.withSpan(async () => {
      const ctx = Correlation.get();
      const start = Date.now();

      try {
        const serialized =
          typeof value === "string" ? value : JSON.stringify(value);

        await this.redis.set(key, serialized, "PX", ttlMs);

        metrics.observe("circuit_store_set_latency_ms", Date.now() - start, {
          key,
        });
      } catch (err: any) {
        logger.error("RedisCircuitStore SET failed", {
          key,
          error: err?.message,
          spanId: ctx.spanId,
          parentSpanId: ctx.parentSpanId,
        });

        metrics.increment("circuit_store_set_error_total", { key });
      }
    });
  }

  // ------------------------------------------------------
  // Safe DEL
  // ------------------------------------------------------
  async del(key: string) {
    return Correlation.withSpan(async () => {
      const ctx = Correlation.get();

      try {
        await this.redis.del(key);
        metrics.increment("circuit_store_del_total", { key });
      } catch (err: any) {
        logger.error("RedisCircuitStore DEL failed", {
          key,
          error: err?.message,
          spanId: ctx.spanId,
          parentSpanId: ctx.parentSpanId,
        });

        metrics.increment("circuit_store_del_error_total", { key });
      }
    });
  }

  // ------------------------------------------------------
  // TTL (ms)
  // ------------------------------------------------------
  async ttl(key: string) {
    return Correlation.withSpan(async () => {
      const ctx = Correlation.get();

      try {
        const ttl = await this.redis.pttl(key);
        metrics.increment("circuit_store_ttl_total", { key });
        return ttl;
      } catch (err: any) {
        logger.error("RedisCircuitStore TTL failed", {
          key,
          error: err?.message,
          spanId: ctx.spanId,
          parentSpanId: ctx.parentSpanId,
        });

        metrics.increment("circuit_store_ttl_error_total", { key });
        return -1;
      }
    });
  }

  // ------------------------------------------------------
  // Namespacing
  // ------------------------------------------------------
  namespaced(name: string) {
    return `circuit:${name}`;
  }
}

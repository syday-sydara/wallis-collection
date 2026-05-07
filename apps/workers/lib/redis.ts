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
  Correlation.withSpan(() => {
    const ctx = Correlation.get();

    logger.info("Redis connected", {
      spanId: ctx.spanId,
      parentSpanId: ctx.parentSpanId,
      workflowId: ctx.workflowId,
    });

    metrics.increment("redis_connect_total");
  });
});

redis.on("reconnecting", () => {
  Correlation.withSpan(() => {
    const ctx = Correlation.get();

    logger.warn("Redis reconnecting", {
      spanId: ctx.spanId,
      parentSpanId: ctx.parentSpanId,
      workflowId: ctx.workflowId,
    });

    metrics.increment("redis_reconnect_total");
  });
});

redis.on("error", (err) => {
  Correlation.withSpan(() => {
    const ctx = Correlation.get();

    logger.error("Redis error", {
      spanId: ctx.spanId,
      parentSpanId: ctx.parentSpanId,
      workflowId: ctx.workflowId,
      error: err?.message,
      code: (err as any)?.code,
    });

    metrics.increment("redis_error_total", {
      code: (err as any)?.code ?? "unknown",
    });
  });
});

// ---------------------------------------------------------
// Optional: Redis command instrumentation
// ---------------------------------------------------------
const originalSend = redis.sendCommand.bind(redis);

redis.sendCommand = (cmd) => {
  const start = Date.now();

  return Correlation.withSpan(() => {
    const ctx = Correlation.get();

    return originalSend(cmd)
      .then((result) => {
        metrics.observe("redis_command_latency_ms", Date.now() - start, {
          command: cmd.name,
        });

        logger.info("Redis command executed", {
          command: cmd.name,
          durationMs: Date.now() - start,
          spanId: ctx.spanId,
          parentSpanId: ctx.parentSpanId,
        });

        return result;
      })
      .catch((err) => {
        metrics.increment("redis_command_error_total", {
          command: cmd.name,
          code: (err as any)?.code,
        });

        logger.error("Redis command failed", {
          command: cmd.name,
          error: err?.message,
          spanId: ctx.spanId,
          parentSpanId: ctx.parentSpanId,
        });

        throw err;
      });
  });
};

// ---------------------------------------------------------
// Graceful shutdown
// ---------------------------------------------------------
export async function shutdownRedis() {
  Correlation.withSpan(async () => {
    const ctx = Correlation.get();

    logger.info("Shutting down Redis", {
      spanId: ctx.spanId,
      parentSpanId: ctx.parentSpanId,
      workflowId: ctx.workflowId,
    });

    metrics.increment("redis_shutdown_total");

    await redis.quit();
  });
}

// ---------------------------------------------------------
// Optional: Redis health check
// ---------------------------------------------------------
export async function redisHealthCheck() {
  const start = Date.now();

  try {
    await redis.ping();
    return { ok: true, latency: Date.now() - start };
  } catch (err: any) {
    return { ok: false, error: err.message };
  }
}

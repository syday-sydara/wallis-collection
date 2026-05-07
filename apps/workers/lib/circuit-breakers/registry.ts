// lib/circuit-breakers/registry.ts
import { CircuitBreaker } from "./circuit-breaker";
import { RedisCircuitStore } from "./stores/redis-store";
import { PrometheusCircuitMetrics } from "./metrics/prometheus-adapter";
import { logger } from "../logger";
import { Correlation } from "../correlation";
import { redis } from "../queue/connection";

// ------------------------------------------------------
// Shared Redis store + metrics adapter
// ------------------------------------------------------
const store = new RedisCircuitStore(redis);
const metrics = new PrometheusCircuitMetrics(require("prom-client"));

// ------------------------------------------------------
// Hardened base config (correlation-aware)
// ------------------------------------------------------
function baseConfig(name: string, overrides = {}) {
  return {
    failureThreshold: 5,
    successThreshold: 2,
    timeoutMs: 30_000,

    store: {
      get: (key) => store.get(store.namespaced(key)),
      set: (key, value, ttl) =>
        store.set(store.namespaced(key), value, ttl),
    },

    onStateChange: (breaker, from, to, durationMs) => {
      Correlation.withSpan(() => {
        const ctx = Correlation.get();

        logger.warn("Circuit breaker state change", {
          breaker,
          from,
          to,
          durationMs,
          spanId: ctx.spanId,
          parentSpanId: ctx.parentSpanId,
          workflowId: ctx.workflowId,
        });

        metrics.recordStateChange(breaker, from, to, durationMs);
      });
    },

    onFailure: (breaker, err) => {
      Correlation.withSpan(() => {
        const ctx = Correlation.get();

        logger.error("Circuit breaker failure", {
          breaker,
          error: err?.message,
          code: err?.code,
          spanId: ctx.spanId,
          parentSpanId: ctx.parentSpanId,
          workflowId: ctx.workflowId,
        });

        metrics.recordFailure(breaker);
      });
    },

    onSuccess: (breaker) => {
      Correlation.withSpan(() => {
        const ctx = Correlation.get();

        metrics.recordSuccess(breaker);

        logger.info("Circuit breaker success", {
          breaker,
          spanId: ctx.spanId,
          parentSpanId: ctx.parentSpanId,
          workflowId: ctx.workflowId,
        });
      });
    },

    ...overrides,
  };
}

// ------------------------------------------------------
// Per‑service breakers (Nigeria‑first tuning)
// ------------------------------------------------------
export const WhatsAppBreaker = new CircuitBreaker(
  baseConfig("whatsapp", { failureThreshold: 3, timeoutMs: 15_000 }),
  "whatsapp"
);

export const SmsBreaker = new CircuitBreaker(
  baseConfig("sms", { failureThreshold: 4, timeoutMs: 20_000 }),
  "sms"
);

export const EmailBreaker = new CircuitBreaker(
  baseConfig("email", { failureThreshold: 5, timeoutMs: 30_000 }),
  "email"
);

export const PaymentBreaker = new CircuitBreaker(
  baseConfig("payment", { failureThreshold: 2, timeoutMs: 60_000 }),
  "payment"
);

// ------------------------------------------------------
// Registry for admin endpoints + introspection
// ------------------------------------------------------
export const CircuitBreakers = {
  whatsapp: WhatsAppBreaker,
  sms: SmsBreaker,
  email: EmailBreaker,
  payment: PaymentBreaker,
};

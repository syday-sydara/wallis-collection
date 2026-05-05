// lib/circuit-breakers.ts
import { CircuitBreaker } from "./circuit-breaker";
import { RedisCircuitStore } from "./stores/redis-store";
import { PrometheusCircuitMetrics } from "./metrics/prometheus-adapter";
import { logger } from "../logger";
import { Correlation } from "../correlation";
import { redis } from "../queue/connection";

const store = new RedisCircuitStore(redis);
const metrics = new PrometheusCircuitMetrics(require("prom-client"));

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
      const ctx = Correlation.get();

      logger.warn("Circuit breaker state change", {
        ...ctx,
        breaker,
        from,
        to,
        durationMs,
      });

      metrics.recordStateChange(breaker, from, to, durationMs);
    },

    onFailure: (breaker, err) => {
      const ctx = Correlation.get();

      logger.error("Circuit breaker failure", {
        ...ctx,
        breaker,
        error: err?.message,
      });

      metrics.recordFailure(breaker);
    },

    onSuccess: (breaker) => {
      // Optional: metrics for success recovery
    },

    ...overrides,
  };
}

// Per‑service tuning
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

// Registry for admin endpoints
export const CircuitBreakers = {
  whatsapp: WhatsAppBreaker,
  sms: SmsBreaker,
  email: EmailBreaker,
  payment: PaymentBreaker,
};

// lib/circuit-breakers/index.ts
import { Correlation } from "@/lib/correlation";
import { logger } from "@/lib/logger";
import { metrics } from "@/lib/metrics";

import { CircuitBreaker } from "./circuit-breaker";
import { CircuitBreakers } from "./registry";
import { RedisCircuitStore } from "./stores/redis-store";
import { PrometheusCircuitMetrics } from "./metrics/prometheus-adapter";

// ------------------------------------------------------
// Hardened initialization wrapper
// ------------------------------------------------------
export function initCircuitBreakers() {
  return Correlation.withSpan(() => {
    const ctx = Correlation.get();

    logger.info("Initializing circuit breakers", {
      spanId: ctx.spanId,
      parentSpanId: ctx.parentSpanId,
      workflowId: ctx.workflowId,
    });

    metrics.increment("circuit_breaker_init_total");

    return {
      CircuitBreaker,
      CircuitBreakers,
      RedisCircuitStore,
      PrometheusCircuitMetrics,
    };
  });
}

// ------------------------------------------------------
// Explicit export surface
// ------------------------------------------------------
export {
  CircuitBreaker,
  CircuitBreakers,
  RedisCircuitStore,
  PrometheusCircuitMetrics,
};

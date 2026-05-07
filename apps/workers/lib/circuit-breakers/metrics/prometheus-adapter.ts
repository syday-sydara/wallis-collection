// lib/circuit-breakers/metrics/prometheus-adapter.ts
import { Correlation } from "@/lib/correlation";
import { logger } from "@/lib/logger";

export class PrometheusCircuitMetrics {
  private stateChangeCounter;
  private openDurationHistogram;
  private failureCounter;
  private successCounter;

  constructor(private registry: any) {
    // ------------------------------------------------------
    // Worker‑safe metric registration
    // ------------------------------------------------------
    this.stateChangeCounter =
      registry.getSingleMetric("circuit_breaker_state_change_total") ||
      new registry.Counter({
        name: "circuit_breaker_state_change_total",
        help: "Number of circuit breaker state transitions",
        labelNames: ["breaker", "from", "to"],
      });

    this.openDurationHistogram =
      registry.getSingleMetric("circuit_breaker_open_duration_seconds") ||
      new registry.Histogram({
        name: "circuit_breaker_open_duration_seconds",
        help: "How long a circuit breaker stayed OPEN before transitioning",
        labelNames: ["breaker"],
        buckets: [1, 5, 10, 30, 60, 120, 300],
      });

    this.failureCounter =
      registry.getSingleMetric("circuit_breaker_failures_total") ||
      new registry.Counter({
        name: "circuit_breaker_failures_total",
        help: "Number of failures recorded while breaker is CLOSED or HALF_OPEN",
        labelNames: ["breaker"],
      });

    this.successCounter =
      registry.getSingleMetric("circuit_breaker_success_total") ||
      new registry.Counter({
        name: "circuit_breaker_success_total",
        help: "Number of successful executions while breaker is HALF_OPEN",
        labelNames: ["breaker"],
      });
  }

  // ------------------------------------------------------
  // State change metric
  // ------------------------------------------------------
  recordStateChange(breakerName: string, from: string, to: string, openDurationMs?: number) {
    Correlation.withSpan(() => {
      const ctx = Correlation.get();

      this.stateChangeCounter.inc({
        breaker: breakerName,
        from,
        to,
      });

      if (from === "OPEN" && openDurationMs != null) {
        this.openDurationHistogram.observe(
          { breaker: breakerName },
          openDurationMs / 1000
        );
      }

      logger.info("Prometheus: circuit breaker state change", {
        breaker: breakerName,
        from,
        to,
        durationMs: openDurationMs,
        spanId: ctx.spanId,
        parentSpanId: ctx.parentSpanId,
        workflowId: ctx.workflowId,
      });
    });
  }

  // ------------------------------------------------------
  // Failure metric
  // ------------------------------------------------------
  recordFailure(breakerName: string) {
    Correlation.withSpan(() => {
      const ctx = Correlation.get();

      this.failureCounter.inc({ breaker: breakerName });

      logger.warn("Prometheus: circuit breaker failure", {
        breaker: breakerName,
        spanId: ctx.spanId,
        parentSpanId: ctx.parentSpanId,
        workflowId: ctx.workflowId,
      });
    });
  }

  // ------------------------------------------------------
  // Success metric
  // ------------------------------------------------------
  recordSuccess(breakerName: string) {
    Correlation.withSpan(() => {
      const ctx = Correlation.get();

      this.successCounter.inc({ breaker: breakerName });

      logger.info("Prometheus: circuit breaker success", {
        breaker: breakerName,
        spanId: ctx.spanId,
        parentSpanId: ctx.parentSpanId,
        workflowId: ctx.workflowId,
      });
    });
  }
}

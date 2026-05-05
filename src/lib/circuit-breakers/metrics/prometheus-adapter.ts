// lib/prometheus-circuit-metrics.ts
export class PrometheusCircuitMetrics {
  private stateChangeCounter;
  private openDurationHistogram;
  private failureCounter;

  constructor(private registry) {
    this.stateChangeCounter = new this.registry.Counter({
      name: "circuit_breaker_state_change_total",
      help: "Number of circuit breaker state transitions",
      labelNames: ["breaker", "from", "to"],
    });

    this.openDurationHistogram = new this.registry.Histogram({
      name: "circuit_breaker_open_duration_seconds",
      help: "How long a circuit breaker stayed OPEN before transitioning",
      labelNames: ["breaker"],
      buckets: [1, 5, 10, 30, 60, 120, 300],
    });

    this.failureCounter = new this.registry.Counter({
      name: "circuit_breaker_failures_total",
      help: "Number of failures recorded while breaker is CLOSED or HALF_OPEN",
      labelNames: ["breaker"],
    });
  }

  recordStateChange(breakerName: string, from: string, to: string, openDurationMs?: number) {
    this.stateChangeCounter.inc({
      breaker: breakerName,
      from,
      to,
    });

    // If breaker moved from OPEN → HALF_OPEN or CLOSED, record how long it was open
    if (from === "OPEN" && openDurationMs != null) {
      this.openDurationHistogram.observe(
        { breaker: breakerName },
        openDurationMs / 1000
      );
    }
  }

  recordFailure(breakerName: string) {
    this.failureCounter.inc({ breaker: breakerName });
  }
}

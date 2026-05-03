export class PrometheusCircuitMetrics {
  constructor(private registry) {}

  recordStateChange(name: string, from: string, to: string) {
    // increment Prometheus counters here
  }
}

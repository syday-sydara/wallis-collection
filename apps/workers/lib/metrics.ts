// lib/metrics.ts
import { Correlation } from "./correlation";
import { logger } from "./logger";
import client from "prom-client";

// ------------------------------------------------------
// Global registry (safe for workers + hot reload)
// ------------------------------------------------------
const registry = client.register;
const counters = new Map<string, client.Counter>();
const histograms = new Map<string, client.Histogram>();

// ------------------------------------------------------
// Public API
// ------------------------------------------------------
export const metrics = {
  increment(name: string, labels: Record<string, any> = {}) {
    try {
      const counter = getCounter(name);
      const ctx = Correlation.get();

      counter.inc({
        spanId: ctx.spanId,
        parentSpanId: ctx.parentSpanId,
        workflowId: ctx.workflowId,
        ...labels,
      });
    } catch (err: any) {
      logger.error("Metrics increment failed", { error: err.message });
    }
  },

  observe(name: string, value: number, labels: Record<string, any> = {}) {
    try {
      const histogram = getHistogram(name);
      const ctx = Correlation.get();

      histogram.observe(
        {
          spanId: ctx.spanId,
          parentSpanId: ctx.parentSpanId,
          workflowId: ctx.workflowId,
          ...labels,
        },
        value
      );
    } catch (err: any) {
      logger.error("Metrics observe failed", { error: err.message });
    }
  },

  // Expose registry for /metrics endpoint
  registry,
};

// ------------------------------------------------------
// Internal helpers
// ------------------------------------------------------
function getCounter(name: string) {
  if (!counters.has(name)) {
    const metricName = sanitize(name);

    // Avoid duplicate metric registration errors
    let counter = registry.getSingleMetric(metricName) as client.Counter | undefined;

    if (!counter) {
      counter = new client.Counter({
        name: metricName,
        help: `${name} counter`,
        labelNames: ["spanId", "parentSpanId", "workflowId"],
        registers: [registry],
      });
    }

    counters.set(name, counter);
  }

  return counters.get(name)!;
}

function getHistogram(name: string) {
  if (!histograms.has(name)) {
    const metricName = sanitize(name);

    let histogram = registry.getSingleMetric(metricName) as client.Histogram | undefined;

    if (!histogram) {
      histogram = new client.Histogram({
        name: metricName,
        help: `${name} histogram`,
        labelNames: ["spanId", "parentSpanId", "workflowId"],
        buckets: [0.01, 0.05, 0.1, 0.3, 1, 3, 5],
        registers: [registry],
      });
    }

    histograms.set(name, histogram);
  }

  return histograms.get(name)!;
}

function sanitize(name: string) {
  return name.replace(/[^a-zA-Z0-9_]/g, "_");
}

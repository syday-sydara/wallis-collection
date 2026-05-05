// lib/metrics.ts
import { Correlation } from "./correlation";
import { logger } from "./logger";
import client from "prom-client";

const counters = new Map<string, client.Counter>();
const histograms = new Map<string, client.Histogram>();

export const metrics = {
  increment(name: string, labels: Record<string, any> = {}) {
    try {
      const counter = getCounter(name);
      const ctx = Correlation.get();

      counter.inc({
        traceId: ctx.traceId,
        requestId: ctx.requestId,
        spanId: ctx.spanId,
        ...labels,
      });
    } catch (err) {
      logger.error("Metrics increment failed", { error: err.message });
    }
  },

  observe(name: string, value: number, labels: Record<string, any> = {}) {
    try {
      const histogram = getHistogram(name);
      const ctx = Correlation.get();

      histogram.observe(
        {
          traceId: ctx.traceId,
          requestId: ctx.requestId,
          spanId: ctx.spanId,
          ...labels,
        },
        value
      );
    } catch (err) {
      logger.error("Metrics observe failed", { error: err.message });
    }
  },
};

// ---------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------
function getCounter(name: string) {
  if (!counters.has(name)) {
    counters.set(
      name,
      new client.Counter({
        name: sanitize(name),
        help: `${name} counter`,
        labelNames: ["traceId", "requestId", "spanId"],
      })
    );
  }
  return counters.get(name)!;
}

function getHistogram(name: string) {
  if (!histograms.has(name)) {
    histograms.set(
      name,
      new client.Histogram({
        name: sanitize(name),
        help: `${name} histogram`,
        labelNames: ["traceId", "requestId", "spanId"],
        buckets: [0.01, 0.05, 0.1, 0.3, 1, 3, 5],
      })
    );
  }
  return histograms.get(name)!;
}

function sanitize(name: string) {
  return name.replace(/[^a-zA-Z0-9_]/g, "_");
}

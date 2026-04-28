// lib/core/metrics.ts

import os from "os";

type CounterMap = Record<string, number>;

interface TimerStats {
  count: number;
  sum: number;
  min: number;
  max: number;
  values: number[]; // for percentiles
}

interface GaugeMap {
  [key: string]: number;
}

const counters: CounterMap = {};
const timers: Record<string, TimerStats> = {};
const gauges: GaugeMap = {};

const METRICS_VERSION = "2.0.0";

function normalizeKey(name: string) {
  return name.trim().replace(/\s+/g, "_").toLowerCase();
}

function safe(fn: () => void) {
  try {
    fn();
  } catch {
    // Metrics must NEVER break the app
  }
}

export const metrics = {
  /* -------------------------------------------------- */
  /* COUNTERS                                           */
  /* -------------------------------------------------- */
  increment(name: string, value = 1) {
    const key = normalizeKey(name);
    safe(() => {
      counters[key] = (counters[key] ?? 0) + value;
    });
  },

  /* -------------------------------------------------- */
  /* GAUGES (set a value)                                */
  /* -------------------------------------------------- */
  gauge(name: string, value: number) {
    const key = normalizeKey(name);
    safe(() => {
      gauges[key] = value;
    });
  },

  /* -------------------------------------------------- */
  /* TIMERS (record durations)                           */
  /* -------------------------------------------------- */
  timing(name: string, ms: number) {
    const key = normalizeKey(name);

    safe(() => {
      if (!timers[key]) {
        timers[key] = {
          count: 0,
          sum: 0,
          min: ms,
          max: ms,
          values: [],
        };
      }

      const t = timers[key];
      t.count++;
      t.sum += ms;
      t.min = Math.min(t.min, ms);
      t.max = Math.max(t.max, ms);
      t.values.push(ms);
    });
  },

  /* -------------------------------------------------- */
  /* SNAPSHOT (export metrics)                           */
  /* -------------------------------------------------- */
  snapshot() {
    const timerSnapshot = Object.fromEntries(
      Object.entries(timers).map(([name, t]) => {
        const sorted = [...t.values].sort((a, b) => a - b);

        const percentile = (p: number) => {
          if (sorted.length === 0) return 0;
          const idx = Math.floor((p / 100) * sorted.length);
          return sorted[Math.min(idx, sorted.length - 1)];
        };

        return [
          name,
          {
            count: t.count,
            sum: t.sum,
            min: t.min,
            max: t.max,
            avg: t.count > 0 ? t.sum / t.count : 0,
            p50: percentile(50),
            p90: percentile(90),
            p99: percentile(99),
          },
        ];
      })
    );

    return {
      version: METRICS_VERSION,
      environment: process.env.NODE_ENV,
      hostname: os.hostname(),
      timestamp: new Date().toISOString(),

      process: {
        pid: process.pid,
        memory: process.memoryUsage(),
        uptime: process.uptime(),
        cpuLoad: os.loadavg(),
      },

      counters: { ...counters },
      gauges: { ...gauges },
      timers: timerSnapshot,
    };
  },

  /* -------------------------------------------------- */
  /* RESET (for tests or local dev)                      */
  /* -------------------------------------------------- */
  reset() {
    for (const key in counters) delete counters[key];
    for (const key in timers) delete timers[key];
    for (const key in gauges) delete gauges[key];
  },
};

// lib/core/metrics-context.ts

import { metrics } from "./metrics";
import { serviceContext } from "./service-context";

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

export const metricsWithContext = {
  /**
   * Increment a counter with contextual tags.
   */
  increment(name: string, value = 1) {
    const ctx = serviceContext.get();
    const base = normalizeKey(name);

    safe(() => metrics.increment(base, value));

    // Contextual tagging
    if (ctx.locale)
      safe(() => metrics.increment(`${base}.locale.${ctx.locale}`, value));
    if (ctx.userId)
      safe(() => metrics.increment(`${base}.user.${ctx.userId}`, value));
    if (ctx.sessionId)
      safe(() => metrics.increment(`${base}.session.${ctx.sessionId}`, value));
    if (ctx.deviceId)
      safe(() => metrics.increment(`${base}.device.${ctx.deviceId}`, value));
  },

  /**
   * Record a timing metric with contextual tags.
   */
  timing(name: string, ms: number) {
    const ctx = serviceContext.get();
    const base = normalizeKey(name);

    safe(() => metrics.timing(base, ms));

    if (ctx.locale)
      safe(() => metrics.timing(`${base}.locale.${ctx.locale}`, ms));
    if (ctx.userId)
      safe(() => metrics.timing(`${base}.user.${ctx.userId}`, ms));
    if (ctx.sessionId)
      safe(() => metrics.timing(`${base}.session.${ctx.sessionId}`, ms));
    if (ctx.deviceId)
      safe(() => metrics.timing(`${base}.device.${ctx.deviceId}`, ms));
  },

  /**
   * Sampled metrics — useful for high-volume events.
   * Example: metricsWithContext.sample(0.1).increment("cart.view");
   */
  sample(rate: number) {
    const clamped = Math.min(Math.max(rate, 0), 1);
    const shouldEmit = Math.random() < clamped;
    return shouldEmit ? metricsWithContext : silentMetrics;
  },

  /**
   * Child metrics — namespace your metrics.
   * Example:
   *   const checkoutMetrics = metricsWithContext.child("checkout");
   *   checkoutMetrics.increment("step_view");
   */
  child(prefix: string) {
    const base = normalizeKey(prefix);

    return {
      increment: (name: string, value = 1) =>
        metricsWithContext.increment(`${base}.${normalizeKey(name)}`, value),

      timing: (name: string, ms: number) =>
        metricsWithContext.timing(`${base}.${normalizeKey(name)}`, ms),

      sample: (rate: number) => metricsWithContext.sample(rate),

      child: (sub: string) =>
        metricsWithContext.child(`${base}.${normalizeKey(sub)}`),
    };
  },

  /**
   * Auto-timing helper.
   * Example:
   *   const end = metricsWithContext.startTimer("checkout.process");
   *   ...do work...
   *   end();
   */
  startTimer(name: string) {
    const start = performance.now();
    return () => {
      const ms = performance.now() - start;
      metricsWithContext.timing(name, ms);
    };
  },
};

// Used when sampling decides not to emit metrics
const silentMetrics = {
  increment() {},
  timing() {},
  sample() {
    return silentMetrics;
  },
  child() {
    return silentMetrics;
  },
  startTimer() {
    return () => {};
  },
};

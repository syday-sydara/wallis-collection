// lib/analytics.ts

/**
 * Dispatches a structured analytics event for checkout progress.
 * Browser-only. Supports sampling, dataLayer, debug mode, and versioning.
 */
export function trackCheckoutStep(
  step: string,
  extra: Record<string, any> = {},
  options?: {
    sampleRate?: number;
    context?: string;
    debug?: boolean;
    dataLayer?: boolean;
  }
) {
  if (typeof window === "undefined") return;

  const {
    sampleRate = 1,
    context = "checkout",
    debug = false,
    dataLayer = false,
  } = options ?? {};

  // Sampling
  if (Math.random() > sampleRate) return;

  const version = 1;
  const EVENT_NAME = "analytics:checkout_step";

  const detail = {
    version,
    step,
    context,
    timestamp: new Date().toISOString(),
    ...extra,
  };

  // Dispatch CustomEvent
  try {
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail }));
  } catch (err) {
    if (debug) console.error("[analytics] dispatch failed", err);
  }

  // Optional: push to dataLayer
  if (dataLayer && Array.isArray((window as any).dataLayer)) {
    try {
      (window as any).dataLayer.push({
        event: "checkout_step",
        ...detail,
      });
    } catch (err) {
      if (debug) console.error("[analytics] dataLayer push failed", err);
    }
  }

  // Optional: debug logging
  if (debug) {
    console.log("[analytics]", detail);
  }
}
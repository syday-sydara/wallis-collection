// lib/analytics.ts

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

  // Clamp sampling rate
  const rate = Math.min(Math.max(sampleRate, 0), 1);
  if (Math.random() > rate) return;

  // Normalize fields
  const safeStep = step.trim();
  const safeContext = context.trim().toLowerCase();

  // Shallow clone metadata
  const safeExtra = { ...extra };

  // Metadata size limit (5 KB)
  try {
    const json = JSON.stringify(safeExtra);
    if (json.length > 5000) {
      safeExtra._truncated = true;
    }
  } catch {
    safeExtra._error = "invalid_metadata";
  }

  const version = 1;
  const EVENT_NAME = "analytics:checkout_step";

  const detail = Object.freeze({
    version,
    step: safeStep,
    context: safeContext,
    timestamp: new Date().toISOString(),
    ...safeExtra,
  });

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

  // Debug logging
  if (debug) {
    console.log("[analytics]", detail);
  }
}

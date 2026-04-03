// lib/analytics.ts

/**
 * Dispatches a structured analytics event for checkout progress.
 * Works only in the browser (no-op on server).
 *
 * Useful for hooking into analytics tools, custom listeners,
 * or data layers without coupling your UI to any specific provider.
 */
export function trackCheckoutStep(
  step: string,
  extra: Record<string, any> = {}
) {
  if (typeof window === "undefined") return;

  const detail = {
    step,
    timestamp: new Date().toISOString(),
    ...extra
  };

  window.dispatchEvent(
    new CustomEvent("checkout_step", { detail })
  );
}

// lib/analytics.ts

export function trackCheckoutStep(step: string, extra: Record<string, any> = {}) {
  if (typeof window === "undefined") return;

  window.dispatchEvent(
    new CustomEvent("checkout_step", {
      detail: {
        step,
        timestamp: new Date().toISOString(),
        ...extra
      }
    })
  );
}

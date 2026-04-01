// lib/metrics.ts

/**
 * Starts a timer for a given metric label.
 * Returns a function that stops the timer, logs the duration, and returns it.
 */
export function startTimer(label: string) {
  const start = performance.now();

  return () => {
    const end = performance.now();
    const duration = end - start;

    const payload = {
      metric: label,
      ms: duration,
      timestamp: new Date().toISOString(),
    };

    // Use console.log for now; can integrate with monitoring services later
    console.log(JSON.stringify(payload));

    return duration;
  };
}
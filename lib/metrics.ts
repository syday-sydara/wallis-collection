// lib/metrics.ts

/**
 * Starts a performance timer for a given metric label.
 * Returns a function that stops the timer, logs the duration, and returns it.
 *
 * Useful for measuring DB queries, API calls, background jobs, etc.
 */
export function startTimer(label: string) {
  const start = performance.now();

  return () => {
    const duration = performance.now() - start;

    const payload = {
      metric: label,
      ms: duration,
      timestamp: new Date().toISOString()
    };

    // Structured logging — easy to pipe into monitoring later
    console.log(JSON.stringify(payload));

    return duration;
  };
}

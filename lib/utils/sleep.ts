// lib/utils/sleep.ts

/**
 * Pause execution for a given number of milliseconds.
 * Supports optional cancellation via AbortSignal.
 *
 * @param ms - Duration to wait in milliseconds
 * @param signal - Optional AbortSignal to cancel the sleep
 *
 * @example
 * await sleep(1000) // waits 1 second
 *
 * @example
 * const controller = new AbortController();
 * sleep(5000, controller.signal).catch(() => console.log("Cancelled"));
 * controller.abort();
 */
export function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  const duration = Math.max(0, Math.round(ms));

  if (signal?.aborted) {
    return Promise.reject(new Error("Sleep aborted"));
  }

  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => resolve(), duration);

    if (signal) {
      const onAbort = () => {
        clearTimeout(timeoutId);
        signal.removeEventListener("abort", onAbort);
        reject(new Error("Sleep aborted"));
      };
      signal.addEventListener("abort", onAbort);
    }
  });
}
// lib/utils/sleep.ts

/**
 * Error thrown when a sleep() call is aborted via AbortSignal.
 */
export class SleepAbortedError extends Error {
  constructor() {
    super("Sleep aborted");
    this.name = "SleepAbortedError";
  }
}

/**
 * Sleep for a given number of milliseconds.
 * Supports cancellation via AbortSignal.
 *
 * @param ms - Duration in milliseconds
 * @param signal - Optional AbortSignal to cancel the sleep
 * @throws {SleepAbortedError} if aborted before completion
 */
export function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  const duration = Math.max(0, Math.round(ms));

  if (signal?.aborted) {
    return Promise.reject(new SleepAbortedError());
  }

  return new Promise<void>((resolve, reject) => {
    const onAbort = () => {
      clearTimeout(timeoutId);
      signal?.removeEventListener("abort", onAbort);
      reject(new SleepAbortedError());
    };

    const timeoutId = setTimeout(() => {
      signal?.removeEventListener("abort", onAbort);
      resolve();
    }, duration);

    if (signal) {
      signal.addEventListener("abort", onAbort, { once: true });
    }
  });
}

/**
 * Convenience alias for sleep().
 * Some developers prefer delay() semantically.
 */
export const delay = sleep;

/**
 * Type guard to check if an error is a SleepAbortedError.
 *
 * @param err - Unknown error
 */
export function isSleepAbortedError(err: unknown): err is SleepAbortedError {
  return err instanceof SleepAbortedError;
}

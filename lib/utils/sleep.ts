// lib/utils/sleep.ts

export class SleepAbortedError extends Error {
  constructor() {
    super("Sleep aborted");
    this.name = "SleepAbortedError";
  }
}

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

// lib/retry.ts
import { logger } from "./logger";
import { metrics } from "./metrics";
import { Correlation } from "./correlation";

export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  retries = 3,
  baseDelay = 200
): Promise<T> {
  let attempt = 0;

  while (true) {
    try {
      return await fn();
    } catch (err: any) {
      attempt += 1;

      const safe =
        err?.code === "ECONNRESET" ||
        err?.code === "ETIMEDOUT" ||
        err?.code === "ECONNABORTED" ||
        err?.response?.status >= 500 ||
        err?.isTransient === true;

      if (!safe || attempt > retries) {
        logger.error("Retry exhausted or unsafe error", {
          error: err?.message,
          code: err?.code,
          status: err?.response?.status,
          attempt,
          retries,
        });

        metrics.increment("retry_exhausted", { attempt, retries });

        throw err;
      }

      const delay = computeDelay(baseDelay, attempt);

      logger.warn("Retrying operation", {
        attempt,
        retries,
        delay,
        error: err?.message,
        code: err?.code,
        status: err?.response?.status,
      });

      metrics.increment("retry_attempt", { attempt });
      metrics.observe("retry_delay_ms", delay);

      await sleep(delay);
    }
  }
}

function computeDelay(base: number, attempt: number) {
  const exp = base * Math.pow(2, attempt);
  const jitter = Math.random() * 50; // jitter to avoid retry storms
  return exp + jitter;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

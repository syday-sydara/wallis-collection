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
  const startTotal = Date.now();

  while (true) {
    try {
      return await Correlation.withSpan(fn);
    } catch (err: any) {
      attempt += 1;

      const safe = isRetryable(err);

      if (!safe || attempt > retries) {
        Correlation.withSpan(() => {
          const ctx = Correlation.get();

          logger.error("Retry exhausted or unsafe error", {
            error: err?.message,
            code: err?.code,
            status: err?.response?.status,
            attempt,
            retries,
            spanId: ctx.spanId,
            parentSpanId: ctx.parentSpanId,
            workflowId: ctx.workflowId,
          });

          metrics.increment("retry_exhausted_total", {
            attempt,
            retries,
          });

          metrics.observe("retry_total_duration_ms", Date.now() - startTotal);
        });

        throw err;
      }

      const delay = computeDelay(baseDelay, attempt);

      Correlation.withSpan(() => {
        const ctx = Correlation.get();

        logger.warn("Retrying operation", {
          attempt,
          retries,
          delay,
          error: err?.message,
          code: err?.code,
          status: err?.response?.status,
          spanId: ctx.spanId,
          parentSpanId: ctx.parentSpanId,
          workflowId: ctx.workflowId,
        });

        metrics.increment("retry_attempt_total", { attempt });
        metrics.observe("retry_delay_ms", delay);
      });

      await sleep(delay);
    }
  }
}

// ---------------------------------------------------------
// Retry classification (hardened)
// ---------------------------------------------------------
function isRetryable(err: any) {
  if (!err) return false;

  const transientCodes = [
    "ECONNRESET",
    "ETIMEDOUT",
    "ECONNABORTED",
    "EAI_AGAIN",
  ];

  if (transientCodes.includes(err?.code)) return true;
  if (err?.isTransient === true) return true;
  if (err?.response?.status >= 500) return true;

  return false;
}

// ---------------------------------------------------------
// Nigeria‑first exponential backoff with jitter
// ---------------------------------------------------------
function computeDelay(base: number, attempt: number) {
  const exp = base * Math.pow(2, attempt);
  const jitter = Math.random() * 50;
  return Math.min(exp + jitter, 3000); // cap at 3s
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

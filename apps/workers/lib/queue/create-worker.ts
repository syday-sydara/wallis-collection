// lib/queue/create-worker.ts
import { Worker } from "bullmq";
import { redis } from "./connection";
import { withCorrelation } from "./worker-wrapper";
import { routeToDeadLetter } from "./dead-letter";
import { logger } from "../logger";
import { metrics } from "../metrics";
import { Correlation } from "../correlation";

export function createWorker(
  queueName: string,
  jobName: string,
  handler: (job) => Promise<any>,
  options: { concurrency?: number } = {}
) {
  const concurrency = options.concurrency ?? 5;

  const worker = new Worker(
    queueName,
    withCorrelation(async (job) => {
      const start = Date.now();

      // Create a span for this job execution
      return Correlation.withSpan(async () => {
        try {
          // Poison message guard
          if (job.data == null || typeof job.data !== "object") {
            throw new Error("Poison message: invalid job payload");
          }

          const result = await handler(job);

          const duration = Date.now() - start;

          logger.info("Worker job completed", {
            queueName,
            jobName,
            jobId: job.id,
            durationMs: duration,
          });

          metrics.increment("queue_job_completed_total", {
            queueName,
            jobName,
          });

          metrics.observe("queue_job_duration_ms", duration, {
            queueName,
            jobName,
          });

          return result;
        } catch (err: any) {
          const attemptsMade = job.attemptsMade ?? 0;
          const maxAttempts = job.opts.attempts ?? 1;
          const exhausted = attemptsMade >= maxAttempts;

          logger.error("Worker job failed", {
            queueName,
            jobName,
            jobId: job.id,
            attemptsMade,
            maxAttempts,
            exhausted,
            error: err?.message,
          });

          metrics.increment("queue_job_failed_total", {
            queueName,
            jobName,
            exhausted,
          });

          if (exhausted) {
            await routeToDeadLetter({
              queueName,
              jobName,
              payload: job.data,
              error: err,
              attemptsMade,
              maxAttempts,
            });
          }

          throw err;
        }
      });
    }),
    {
      connection: redis,
      concurrency,
    }
  );

  // ---------------------------------------------------------
  // Worker-level events (correlation-aware)
  // ---------------------------------------------------------
  worker.on("error", (err) => {
    const ctx = Correlation.get();
    logger.error("Worker runtime error", {
      queueName,
      jobName,
      error: err?.message,
      ...ctx,
    });

    metrics.increment("worker_runtime_error_total", {
      queueName,
      jobName,
    });
  });

  worker.on("failed", (job, err) => {
    const ctx = Correlation.get();
    logger.error("Worker job failed event", {
      queueName,
      jobName,
      jobId: job?.id,
      error: err?.message,
      ...ctx,
    });

    metrics.increment("worker_failed_event_total", {
      queueName,
      jobName,
    });
  });

  worker.on("completed", (job) => {
    const ctx = Correlation.get();
    logger.info("Worker job completed event", {
      queueName,
      jobName,
      jobId: job.id,
      ...ctx,
    });

    metrics.increment("worker_completed_event_total", {
      queueName,
      jobName,
    });
  });

  return worker;
}

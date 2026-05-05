// lib/queue/create-worker.ts
import { Worker } from "bullmq";
import { redis } from "./connection";
import { withCorrelation } from "./worker-wrapper";
import { routeToDeadLetter } from "./dead-letter";
import { logger } from "../logger";

export function createWorker(queueName: string, jobName: string, handler: (job) => Promise<any>) {
  const worker = new Worker(
    queueName,
    withCorrelation(async (job) => {
      try {
        return await handler(job);
      } catch (err: any) {
        const attemptsMade = job.attemptsMade ?? 0;
        const maxAttempts = job.opts.attempts ?? 1;

        const exhausted = attemptsMade >= maxAttempts;

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

        logger.error("Worker job failed", {
          queueName,
          jobName,
          attemptsMade,
          maxAttempts,
          exhausted,
          error: err?.message,
        });

        throw err;
      }
    }),
    { connection: redis }
  );

  return worker;
}

// lib/queue/index.ts
import { Queue } from "bullmq";
import { redis } from "./connection";
import { logger } from "../logger";
import { metrics } from "../metrics";
import { Correlation } from "../correlation";

const queueCache = new Map<string, Queue>();

function getQueue(queueName: string) {
  if (!queueCache.has(queueName)) {
    const q = new Queue(queueName, {
      connection: redis,
    });

    queueCache.set(queueName, q);
  }
  return queueCache.get(queueName)!;
}

export const queue = {
  async add(
    queueName: string,
    jobName: string,
    payload: any,
    opts: any = {}
  ) {
    const q = getQueue(queueName);

    // Poison message guard
    if (payload == null || typeof payload !== "object") {
      throw new Error("Poison message: invalid payload for queue.add()");
    }

    // Inject correlation ID if missing
    const ctx = Correlation.get();
    const finalPayload = {
      ...payload,
      traceId: payload.traceId ?? ctx?.traceId ?? Correlation.id(),
    };

    const finalOpts = {
      removeOnComplete: true,
      removeOnFail: false,
      attempts: 3,
      backoff: { type: "exponential", delay: 2000 },
      ...opts,
    };

    logger.info("Enqueue job", {
      queueName,
      jobName,
      traceId: finalPayload.traceId,
      opts: finalOpts,
    });

    metrics.increment("queue_job_enqueued_total", {
      queueName,
      jobName,
    });

    const start = Date.now();

    const job = await q.add(jobName, finalPayload, finalOpts);

    metrics.observe("queue_enqueue_latency_ms", Date.now() - start, {
      queueName,
      jobName,
    });

    return job;
  },
};

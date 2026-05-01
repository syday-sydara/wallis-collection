// workers/audit.worker.ts
import { Worker } from "bullmq";
import { auditQueue } from "../queues/audit.queue";
import { connection } from "../config/redis";
import { Events } from "../events";
import type { EventPayloads, EventName } from "../events/payloads";

export const auditWorker = new Worker<EventPayloads[EventName]>(
  auditQueue.name,
  async job => {
    const event = job.name as EventName;
    const payload = job.data as EventPayloads[typeof event];

    switch (event) {
      case Events.AUDIT_LOG_CREATED: {
        const { logId } = payload;

        // Forward to analytics / SIEM / monitoring pipelines
        // (intentionally left as a hook)

        break;
      }

      default:
        throw new Error(`Unhandled audit event: ${event}`);
    }
  },
  {
    connection,
    // Nigeria‑first reliability: prevents worker from stalling silently
    concurrency: 5,
  }
);

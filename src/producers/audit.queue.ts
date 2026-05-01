// queues/audit.queue.ts
import { Queue } from "bullmq";
import { connection } from "../config/redis";

export const auditQueue = new Queue("audit", {
  connection,
  defaultJobOptions: {
    attempts: 3, // retry transient failures
    backoff: { type: "fixed", delay: 1000 }, // simple retry strategy
    removeOnComplete: true, // keep Redis clean
    removeOnFail: false, // keep failed jobs for debugging
  },
  // Optional: rate limit if audit logs spike heavily
  // limiter: {
  //   max: 100,
  //   duration: 1000,
  // },
});

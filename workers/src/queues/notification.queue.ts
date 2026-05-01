import { Queue } from "bullmq";
import { connection } from "../config/redis";

export const notificationQueue = new Queue("notification", {
  connection,
  defaultJobOptions: {
    removeOnComplete: true,
    removeOnFail: false,
    attempts: 3,
    backoff: { type: "fixed", delay: 1000 },
  },
});

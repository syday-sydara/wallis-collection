import { Queue } from "bullmq";
import { connection } from "../config/redis";

export const orderQueue = new Queue("order", {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: "exponential", delay: 2000 },
    removeOnComplete: true,
    removeOnFail: false,
  },
});

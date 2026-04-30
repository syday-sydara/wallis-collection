import { Queue } from "bullmq";
import { connection } from "../config/redis";

export const paymentQueue = new Queue("payment", {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: "exponential", delay: 1500 },
    removeOnComplete: true,
  },
});

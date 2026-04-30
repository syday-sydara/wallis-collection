import { Queue } from "bullmq";
import { connection } from "../config/redis";

export const inventoryQueue = new Queue("inventory", {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: "fixed", delay: 1000 },
    removeOnComplete: true,
  },
});

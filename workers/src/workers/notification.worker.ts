import { Worker } from "bullmq";
import { connection } from "../config/redis";

export const notificationWorker = new Worker(
  "notification",
  async (job) => {
    console.log("Sending notification:", job.name, job.data);
  },
  { connection }
);

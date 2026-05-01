import { Queue } from "bullmq";
import { connection } from "../config/redis";

export const notificationQueue = new Queue("notification", {
  connection,
  defaultJobOptions: {
    attempts: 5, // notifications often need retries
    backoff: {
      type: "exponential",
      delay: 2000, // exponential backoff for provider throttling
    },
    removeOnComplete: true,
    removeOnFail: false, // keep failed notifications for inspection
  },
  // Optional: rate limit to avoid provider throttling
  // limiter: {
  //   max: 20,
  //   duration: 1000, // 20 notifications per second
  // },
});

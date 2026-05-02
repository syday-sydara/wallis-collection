import { Queue } from "bullmq";
import { connection } from "@config/redis"; // adjust if needed

export const auditQueue = new Queue("audit", {
  connection,
});

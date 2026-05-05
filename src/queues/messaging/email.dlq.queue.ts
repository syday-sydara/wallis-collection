import { Queue } from "bullmq";
import { redis } from "../../lib/queue/connection";

export const EmailDLQ = new Queue("email.dlq", {
  connection: redis,
});

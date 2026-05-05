import { Queue } from "bullmq";
import { redis } from "../../lib/queue/connection";

export const SmsDLQ = new Queue("sms.dlq", {
  connection: redis,
});

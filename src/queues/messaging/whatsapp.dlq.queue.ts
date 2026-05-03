import { Queue } from "bullmq";
import { redis } from "../../lib/queue/connection";

export const WhatsAppDLQ = new Queue("whatsapp.dlq", {
  connection: redis,
});

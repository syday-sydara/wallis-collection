// queues/whatsapp.outbound.queue.ts
import { Queue } from "bullmq";
import { connection } from "../../config/env";

export const WHATSAPP_OUTBOUND_QUEUE_NAME = "whatsapp.outbound";

export const whatsappOutboundQueue = new Queue(
  WHATSAPP_OUTBOUND_QUEUE_NAME,
  {
    connection,
    prefix: "bull",

    defaultJobOptions: {
      attempts: 5,
      backoff: { type: "exponential", delay: 2000 },
      removeOnComplete: true,
      removeOnFail: false,
    },
  }
);

// Observability
whatsappOutboundQueue.on("error", err =>
  console.error("[WHATSAPP OUTBOUND QUEUE ERROR]", err)
);

whatsappOutboundQueue.on("active", job =>
  console.log(`[WHATSAPP OUTBOUND QUEUE] Active job ${job.id}`)
);

whatsappOutboundQueue.on("completed", job =>
  console.log(`[WHATSAPP OUTBOUND QUEUE] Completed job ${job.id}`)
);

whatsappOutboundQueue.on("failed", (job, err) =>
  console.error(`[WHATSAPP OUTBOUND QUEUE] Job failed ${job?.id}`, err)
);

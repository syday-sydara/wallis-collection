// workers/whatsapp.outbound.worker.ts
import { Worker } from "bullmq";
import { WHATSAPP_OUTBOUND_QUEUE_NAME } from "../queues/whatsapp.outbound.queue";
import { connection } from "../config/redis";
import { WhatsAppService } from "../services/whatsapp.service";

export const whatsappOutboundWorker = new Worker(
  WHATSAPP_OUTBOUND_QUEUE_NAME,
  async job => {
    const { to, template, variables } = job.data;

    try {
      await WhatsAppService.sendTemplate({
        to,
        template,
        variables,
      });

      console.log("[WHATSAPP OUTBOUND WORKER] Sent:", { to, template });
    } catch (err) {
      console.error("[WHATSAPP OUTBOUND WORKER] Failed:", err);
      throw err;
    }
  },
  {
    connection,
    concurrency: 10,
  }
);

// Lifecycle logging
whatsappOutboundWorker.on("ready", () =>
  console.log("[WHATSAPP OUTBOUND WORKER] Ready")
);

whatsappOutboundWorker.on("failed", (job, err) =>
  console.error(`[WHATSAPP OUTBOUND WORKER] Job failed ${job?.id}`, err)
);

process.on("SIGTERM", async () => {
  console.log("[WHATSAPP OUTBOUND WORKER] Shutting down...");
  await whatsappOutboundWorker.close();
});

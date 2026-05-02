// workers/whatsapp.outbound.worker.ts
import { Worker } from "bullmq";
import { WHATSAPP_OUTBOUND_QUEUE_NAME } from "../queues/whatsapp.outbound.queue";
import { connection } from "../config/redis";
import { WhatsAppProvider } from "../providers/whatsapp.provider";
import { prisma } from "../config/prisma";
import { normalizePhone } from "../utils/phone";
import { redis } from "../config/redis";

export const whatsappOutboundWorker = new Worker(
  WHATSAPP_OUTBOUND_QUEUE_NAME,
  async job => {
    const { to, template, variables, messageId, sessionId } = job.data;

    const phone = normalizePhone(to);
    if (!phone) {
      console.error("[WHATSAPP WORKER] Invalid phone:", to);
      return;
    }

    // ---------------------------------------------------------
    // 1. Mark message as SENDING
    // ---------------------------------------------------------
    await prisma.whatsAppMessage.update({
      where: { id: messageId },
      data: { status: "SENDING" },
    });

    redis.publish(
      "whatsapp:events",
      JSON.stringify({
        type: "message.outbound.sending",
        messageId,
        sessionId,
        timestamp: Date.now(),
      })
    );

    try {
      // ---------------------------------------------------------
      // 2. Send via provider
      // ---------------------------------------------------------
      await WhatsAppProvider.send({
        to: phone,
        template,
        variables,
      });

      // ---------------------------------------------------------
      // 3. Mark as SENT
      // ---------------------------------------------------------
      await prisma.whatsAppMessage.update({
        where: { id: messageId },
        data: { status: "SENT" },
      });

      // Update session activity
      await prisma.whatsAppSession.update({
        where: { id: sessionId },
        data: { lastMessageAt: new Date() },
      });

      // Emit real-time event
      redis.publish(
        "whatsapp:events",
        JSON.stringify({
          type: "message.outbound.sent",
          messageId,
          sessionId,
          timestamp: Date.now(),
        })
      );

      console.log("[WHATSAPP WORKER] Sent:", { to: phone, template });
    } catch (err) {
      console.error("[WHATSAPP WORKER] Failed:", err);

      // ---------------------------------------------------------
      // 4. Mark as FAILED
      // ---------------------------------------------------------
      await prisma.whatsAppMessage.update({
        where: { id: messageId },
        data: {
          status: "FAILED",
          error: String(err),
        },
      });

      redis.publish(
        "whatsapp:events",
        JSON.stringify({
          type: "message.outbound.failed",
          messageId,
          sessionId,
          error: String(err),
          timestamp: Date.now(),
        })
      );

      throw err; // allow BullMQ retry logic
    }
  },
  {
    connection,
    concurrency: 10,
  }
);

whatsappOutboundWorker.on("ready", () =>
  console.log("[WHATSAPP WORKER] Ready")
);

whatsappOutboundWorker.on("failed", (job, err) =>
  console.error(`[WHATSAPP WORKER] Job failed ${job?.id}`, err)
);

process.on("SIGTERM", async () => {
  console.log("[WHATSAPP WORKER] Shutting down...");
  await whatsappOutboundWorker.close();
});

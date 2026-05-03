// workers/whatsapp.outbound.worker.ts
import { Worker } from "bullmq";
import { WHATSAPP_OUTBOUND_QUEUE_NAME } from "../queues/messaging/whatsapp.outbound.queue";
import { connection, redis } from "../config/env";
import { prisma } from "../config/prisma";

import { normalizePhone } from "../utils/phone";
import { WhatsAppProvider } from "../providers/whatsapp.provider";
import { SmsProvider } from "../providers/sms.provider";
import { EmailProvider } from "../providers/email.provider";

export const whatsappOutboundWorker = new Worker(
  WHATSAPP_OUTBOUND_QUEUE_NAME,
  async job => {
    const { to, template, variables, messageId, sessionId, text, subject } = job.data;

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

    // ---------------------------------------------------------
    // 2. Tiered delivery: WhatsApp → SMS → Email
    // ---------------------------------------------------------
    try {
      // Tier 1: WhatsApp
      await WhatsAppProvider.send({ to: phone, template, variables });

      await markSent(messageId, sessionId);
      console.log("[WHATSAPP WORKER] Delivered via WhatsApp:", { to: phone });
      return;
    } catch (waErr) {
      console.warn("[WHATSAPP WORKER] WhatsApp failed, falling back to SMS", waErr);
    }

    try {
      // Tier 2: SMS
      await SmsProvider.send({ to: phone, text });

      await markSent(messageId, sessionId);
      console.log("[WHATSAPP WORKER] Delivered via SMS fallback:", { to: phone });
      return;
    } catch (smsErr) {
      console.warn("[WHATSAPP WORKER] SMS fallback failed, falling back to Email", smsErr);
    }

    try {
      // Tier 3: Email
      await EmailProvider.send({ to, subject, text });

      await markSent(messageId, sessionId);
      console.log("[WHATSAPP WORKER] Delivered via Email fallback:", { to });
      return;
    } catch (emailErr) {
      console.error("[WHATSAPP WORKER] All channels failed", emailErr);

      await prisma.whatsAppMessage.update({
        where: { id: messageId },
        data: {
          status: "FAILED",
          error: String(emailErr),
        },
      });

      redis.publish(
        "whatsapp:events",
        JSON.stringify({
          type: "message.outbound.failed",
          messageId,
          sessionId,
          error: String(emailErr),
          timestamp: Date.now(),
        })
      );

      throw emailErr; // allow BullMQ retry logic
    }
  },
  {
    connection,
    concurrency: 10,
  }
);

// ---------------------------------------------------------
// Helper: mark message as SENT + update session
// ---------------------------------------------------------
async function markSent(messageId: string, sessionId: string) {
  await prisma.whatsAppMessage.update({
    where: { id: messageId },
    data: { status: "SENT" },
  });

  await prisma.whatsAppSession.update({
    where: { id: sessionId },
    data: { lastMessageAt: new Date() },
  });

  redis.publish(
    "whatsapp:events",
    JSON.stringify({
      type: "message.outbound.sent",
      messageId,
      sessionId,
      timestamp: Date.now(),
    })
  );
}

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

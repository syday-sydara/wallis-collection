// services/whatsapp.service.ts
import { whatsappTemplates } from "@/templates/whatsapp.templates";
import { WhatsAppOutboundProducer } from "@/producers/whatsapp.producer";
import { normalizePhone } from "@/utils/phone";
import { prisma } from "@/lib/prisma";
import { WhatsAppSessionManager } from "@/services/whatsapp-session-manager";
import { Correlation } from "@/lib/correlation";
import { logger } from "@/lib/logger";

export class WhatsAppService {
  /**
   * High-level API:
   * sendTemplate({ event, payload })
   *
   * Guarantees:
   * - strict phone resolution
   * - strict template resolution
   * - unified variable resolution
   * - unified message creation
   * - unified outbound enqueue
   */
  static async sendTemplate({
    event,
    payload,
  }: {
    event: string;
    payload: any;
  }) {
    const ctx = Correlation.get();

    // 1. Resolve phone (deduplicated)
    const phone = resolvePhone(payload);
    if (!phone) {
      logger.error("[WHATSAPP] Invalid phone", { ...ctx, payload });
      return;
    }

    // 2. Resolve or create session
    const session = await WhatsAppSessionManager.getOrCreateSession(phone);

    // 3. Resolve template
    const tpl = whatsappTemplates[event];
    if (!tpl) {
      logger.error("[WHATSAPP] Unknown template", { ...ctx, event });
      return;
    }

    // 4. Resolve variables
    const variables = tpl.resolve(payload);

    // 5. Create DB message record (deduplicated)
    const message = await createOutboundMessage(session.id, tpl, payload);

    // 6. Enqueue outbound job (deduplicated)
    await WhatsAppOutboundProducer.send(tpl.name, phone, {
      sessionId: session.id,
      messageId: message.id,
      variables,
      rawPayload: payload,
      ...ctx,
    });

    logger.info("[WHATSAPP] Outbound message enqueued", {
      ...ctx,
      template: tpl.name,
      to: phone,
      sessionId: session.id,
      messageId: message.id,
    });

    return message;
  }
}

// ------------------------------------------------------
// INTERNAL HELPERS (deduplicated logic)
// ------------------------------------------------------

function resolvePhone(payload: any): string | null {
  return (
    normalizePhone(payload.phoneNumber) ??
    normalizePhone(payload.customerPhone) ??
    normalizePhone(payload.whatsappPhone) ??
    null
  );
}

async function createOutboundMessage(sessionId: string, tpl: any, payload: any) {
  return prisma.whatsAppMessage.create({
    data: {
      sessionId,
      direction: "OUTBOUND",
      body: tpl.preview ? tpl.preview(payload) : "",
      status: "QUEUED",
    },
  });
}

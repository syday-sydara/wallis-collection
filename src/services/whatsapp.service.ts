// services/whatsapp.service.ts
import { whatsappTemplates } from "../templates/whatsapp.templates";
import { WhatsAppOutboundProducer } from "../producers/whatsapp.outbound.producer";
import { normalizePhone } from "../utils/phone";
import { prisma } from "../config/prisma";
import { WhatsAppSessionManager } from "./whatsapp-session-manager";

export class WhatsAppService {
  /**
   * High-level API:
   * sendTemplate({ event, payload })
   */
  static async sendTemplate({
    event,
    payload,
  }: {
    event: string;
    payload: any;
  }) {
    // 1. Resolve phone
    const phone = normalizePhone(
      payload.phoneNumber ??
      payload.customerPhone ??
      payload.whatsappPhone
    );

    if (!phone) {
      console.error("[WHATSAPP SERVICE] Invalid phone:", payload);
      return;
    }

    // 2. Resolve or create session
    const session = await WhatsAppSessionManager.getOrCreateSession(phone);

    // 3. Resolve template
    const tpl = whatsappTemplates[event];
    if (!tpl) {
      console.error("[WHATSAPP SERVICE] Unknown template:", event);
      return;
    }

    // 4. Resolve variables
    const resolvedVars = tpl.resolve(payload);

    // 5. Create DB message record
    const message = await prisma.whatsAppMessage.create({
      data: {
        sessionId: session.id,
        direction: "OUTBOUND",
        body: tpl.preview ? tpl.preview(payload) : "",
        status: "QUEUED",
      },
    });

    // 6. Enqueue outbound job
    await WhatsAppOutboundProducer.send(tpl.name, phone, {
      sessionId: session.id,
      messageId: message.id,
      variables: resolvedVars,
      rawPayload: payload,
    });

    console.log("[WHATSAPP SERVICE] Enqueued outbound message:", {
      template: tpl.name,
      to: phone,
    });

    return message;
  }
}

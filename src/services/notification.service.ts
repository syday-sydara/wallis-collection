// services/whatsapp.service.ts
import { prisma } from "../lib/prisma";
import { normalizePhone } from "../utils/phone";
import { WhatsAppSessionManager } from "./whatsapp-session-manager";
import { WhatsAppProvider } from "../providers/whatsapp.provider";

export const WhatsAppService = {
  /**
   * Send a WhatsApp template message using a sessionId.
   * This is the ONLY entry point for outbound WhatsApp notifications.
   */
  async sendTemplate(input: {
    sessionId: string;
    event: string;
    payload: any;
  }) {
    const { sessionId, event, payload } = input;

    // ------------------------------------------------------
    // 1. Load session
    // ------------------------------------------------------
    const session = await prisma.whatsAppSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      console.error("[WHATSAPP] Session not found →", sessionId);
      return;
    }

    // ------------------------------------------------------
    // 2. Resolve phone
    // ------------------------------------------------------
    const phone = normalizePhone(session.phoneNormalized);
    if (!phone) {
      console.error("[WHATSAPP] Invalid phone for session →", sessionId);
      return;
    }

    // ------------------------------------------------------
    // 3. Resolve template
    // ------------------------------------------------------
    const template = this.resolveTemplate(event, payload);

    if (!template) {
      console.warn("[WHATSAPP] No template for event →", event);
      return;
    }

    // ------------------------------------------------------
    // 4. Record outbound message (QUEUED)
    // ------------------------------------------------------
    const messageRecord = await prisma.whatsAppMessage.create({
      data: {
        sessionId,
        direction: "OUTBOUND",
        body: template.bodyText ?? "",
        status: "QUEUED",
        rawPayload: {
          event,
          payload,
          template,
        },
      },
    });

    // ------------------------------------------------------
    // 5. Enqueue provider send
    // ------------------------------------------------------
    try {
      await WhatsAppProvider.sendTemplate({
        to: phone,
        template,
        messageId: messageRecord.id,
      });

      console.log("[WHATSAPP] Enqueued outbound →", messageRecord.id);
    } catch (err) {
      console.error("[WHATSAPP] Provider enqueue failed →", err);

      await prisma.whatsAppMessage.update({
        where: { id: messageRecord.id },
        data: { status: "FAILED" },
      });
    }

    return messageRecord;
  },

  /**
   * Resolve a template for a given event.
   * This keeps WhatsAppService decoupled from NotificationService.
   */
  resolveTemplate(event: string, payload: any) {
    const templates = {
      "order.confirmed": () => ({
        name: "order_confirmed",
        language: "en",
        components: [
          { type: "body", parameters: [{ type: "text", text: payload.orderId }] },
        ],
        bodyText: `Your order ${payload.orderId} has been confirmed.`,
      }),

      "order.shipped": () => ({
        name: "order_shipped",
        language: "en",
        components: [
          { type: "body", parameters: [{ type: "text", text: payload.orderId }] },
        ],
        bodyText: `Your order ${payload.orderId} has been shipped.`,
      }),

      "order.delivered": () => ({
        name: "order_delivered",
        language: "en",
        components: [
          { type: "body", parameters: [{ type: "text", text: payload.orderId }] },
        ],
        bodyText: `Your order ${payload.orderId} has been delivered.`,
      }),
    };

    return templates[event]?.();
  },
};

// services/notification.service.ts
import { EmailProvider } from "../providers/email.provider";
import { SmsProvider } from "../providers/sms.provider";
import { WhatsAppService } from "./whatsapp.service";
import {
  NotificationTemplates,
  NotificationMessage,
} from "../templates/notification.templates";
import { normalizePhone } from "../utils/phone";
import { prisma } from "../lib/prisma";

export const NotificationService = {
  /**
   * Main entry point for all notifications.
   * Accepts eventName + eventPayload from NotificationWorker.
   */
  async send(event: string, payload: any) {
    const templateFn = NotificationTemplates[event];

    if (!templateFn) {
      console.warn("[NOTIFICATION] No template found for:", event);
      return;
    }

    const message: NotificationMessage = templateFn(payload);

    // Resolve customer email if needed
    const email = await this.resolveEmail(payload);

    await Promise.allSettled([
      this.sendEmail(message, email),
      this.sendSMS(message, payload),
      this.sendWhatsApp(message, payload),
    ]);
  },

  // ------------------------------------------------------
  // EMAIL
  // ------------------------------------------------------
  async resolveEmail(payload: any): Promise<string | null> {
    if (payload.email) return payload.email;

    if (payload.customerId) {
      const customer = await prisma.customer.findUnique({
        where: { id: payload.customerId },
      });
      return customer?.email ?? null;
    }

    return null;
  },

  async sendEmail(message: NotificationMessage, email: string | null) {
    if (!email) return;

    try {
      await EmailProvider.send({
        to: email,
        subject: message.subject,
        html: message.bodyHtml,
        text: message.bodyText,
      });

      console.log("[NOTIFICATION] Email sent →", email);
    } catch (err) {
      console.error("[NOTIFICATION] Email failed →", email, err);
    }
  },

  // ------------------------------------------------------
  // SMS (uses customerPhone)
  // ------------------------------------------------------
  async sendSMS(message: NotificationMessage, payload: any) {
    const phone = normalizePhone(payload.customerPhone);
    if (!phone) return;

    try {
      await SmsProvider.send({
        to: phone,
        text: message.bodyText,
      });

      console.log("[NOTIFICATION] SMS sent →", phone);
    } catch (err) {
      console.error("[NOTIFICATION] SMS failed →", phone, err);
    }
  },

  // ------------------------------------------------------
  // WHATSAPP (uses sessionId)
  // ------------------------------------------------------
  async sendWhatsApp(message: NotificationMessage, payload: any) {
    if (!payload.sessionId) {
      console.warn("[NOTIFICATION] WhatsApp skipped → no sessionId");
      return;
    }

    try {
      await WhatsAppService.sendTemplate({
        sessionId: payload.sessionId,
        event: message.event,
        payload,
      });

      console.log("[NOTIFICATION] WhatsApp enqueued → session:", payload.sessionId);
    } catch (err) {
      console.error("[NOTIFICATION] WhatsApp enqueue failed →", err);
    }
  },

  // ------------------------------------------------------
  // Convenience wrappers
  // ------------------------------------------------------
  sendOrderConfirmed(payload: any) {
    return this.send("order.confirmed", payload);
  },

  sendOrderShipped(payload: any) {
    return this.send("order.shipped", payload);
  },

  sendOrderDelivered(payload: any) {
    return this.send("order.delivered", payload);
  },

  sendPaymentSuccess(payload: any) {
    return this.send("payment.success", payload);
  },

  sendPaymentFailed(payload: any) {
    return this.send("payment.failed", payload);
  },

  sendShipmentCreated(payload: any) {
    return this.send("shipment.created", payload);
  },

  sendFailedDelivery(payload: any) {
    return this.send("shipment.failed_delivery", payload);
  },
};

// services/notification.service.ts
import { EmailProvider } from "../providers/email.provider";
import { SmsProvider } from "../providers/sms.provider";
import { WhatsAppOutboundProducer } from "../producers/whatsapp.outbound.producer";
import {
  NotificationTemplates,
  NotificationMessage,
} from "../templates/notification.templates";

export const NotificationService = {
  /**
   * Main entry point
   * - Renders template
   * - Dispatches across channels
   * - Each channel isolated (Promise.allSettled)
   */
  async send(event: string, payload: any) {
    const template = NotificationTemplates[event];

    if (!template) {
      console.warn("[NOTIFICATION] No template found for:", event);
      return;
    }

    const message = template(payload);

    await Promise.allSettled([
      this.sendEmail(message, payload),
      this.sendSMS(message, payload),
      this.sendWhatsApp(message, payload),
    ]);
  },

  // ---------------------------------------------------------
  // EMAIL
  // ---------------------------------------------------------
  async sendEmail(message: NotificationMessage, payload: any) {
    if (!payload.email) return;

    try {
      await EmailProvider.send({
        to: payload.email,
        subject: message.subject,
        html: message.bodyHtml,
        text: message.bodyText,
      });

      console.log("[NOTIFICATION] Email sent →", payload.email);
    } catch (err) {
      console.error("[NOTIFICATION] Email failed →", payload.email, err);
    }
  },

  // ---------------------------------------------------------
  // SMS
  // ---------------------------------------------------------
  async sendSMS(message: NotificationMessage, payload: any) {
    if (!payload.phoneNumber) return;

    try {
      await SmsProvider.send({
        to: payload.phoneNumber,
        text: message.bodyText,
      });

      console.log("[NOTIFICATION] SMS sent →", payload.phoneNumber);
    } catch (err) {
      console.error("[NOTIFICATION] SMS failed →", payload.phoneNumber, err);
    }
  },

  // ---------------------------------------------------------
  // WHATSAPP (via outbound queue)
  // ---------------------------------------------------------
  async sendWhatsApp(message: NotificationMessage, payload: any) {
    if (!payload.phoneNumber) return;

    try {
      await WhatsAppOutboundProducer.send(
        message.event, // template key
        payload.phoneNumber,
        payload // variables passed to template resolver
      );

      console.log("[NOTIFICATION] WhatsApp enqueued →", payload.phoneNumber);
    } catch (err) {
      console.error("[NOTIFICATION] WhatsApp enqueue failed →", payload.phoneNumber, err);
    }
  },

  // ---------------------------------------------------------
  // Convenience wrappers
  // ---------------------------------------------------------
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

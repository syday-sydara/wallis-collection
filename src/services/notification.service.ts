// services/notification.service.ts
import { EmailProvider } from "../providers/email.provider";
import { SmsProvider } from "../providers/sms.provider";
import { WhatsAppService } from "./whatsapp.service";
import {
  NotificationTemplates,
  NotificationMessage,
} from "../templates/notification.templates";
import { normalizePhone } from "../utils/phone";

export const NotificationService = {
  async send(event: string, payload: any) {
    const templateFn = NotificationTemplates[event];

    if (!templateFn) {
      console.warn("[NOTIFICATION] No template found for:", event);
      return;
    }

    const message: NotificationMessage = templateFn(payload);

    await Promise.allSettled([
      this.sendEmail(message, payload),
      this.sendSMS(message, payload),
      this.sendWhatsApp(message, payload),
    ]);
  },

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

  async sendSMS(message: NotificationMessage, payload: any) {
    const phone = normalizePhone(payload.phoneNumber);
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

  async sendWhatsApp(message: NotificationMessage, payload: any) {
    try {
      await WhatsAppService.sendTemplate({
        event: message.event,
        payload,
      });

      console.log("[NOTIFICATION] WhatsApp enqueued →", payload);
    } catch (err) {
      console.error("[NOTIFICATION] WhatsApp enqueue failed →", err);
    }
  },

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

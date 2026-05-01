// services/notification.service.ts
import { EmailProvider } from "../providers/email.provider";
import { SmsProvider } from "../providers/sms.provider";
import { WhatsAppProvider } from "../providers/whatsapp.provider";
import { NotificationTemplates, NotificationMessage } from "./notification.templates";

export const NotificationService = {
  async send(event: string, payload: any) {
    const template = NotificationTemplates[event];
    if (!template) {
      console.warn("No template found for notification:", event);
      return;
    }

    const message = template(payload);

    await Promise.all([
      this.sendEmail(message, payload),
      this.sendSMS(message, payload),
      this.sendWhatsApp(message, payload),
    ]);
  },

  async sendEmail(message: NotificationMessage, payload: any) {
    if (!payload.email) return;
    await EmailProvider.send({
      to: payload.email,
      subject: message.subject,
      html: message.bodyHtml,
      text: message.bodyText,
    });
  },

  async sendSMS(message: NotificationMessage, payload: any) {
    if (!payload.phoneNumber) return;
    await SmsProvider.send({
      to: payload.phoneNumber,
      text: message.bodyText,
    });
  },

  async sendWhatsApp(message: NotificationMessage, payload: any) {
    if (!payload.phoneNumber) return;
    await WhatsAppProvider.send({
      to: payload.phoneNumber,
      text: message.bodyText,
    });
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

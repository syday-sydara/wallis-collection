// services/messaging.service.ts
import { WhatsAppProvider } from "../providers/whatsapp.provider";
import { SmsProvider } from "../providers/sms.provider";
import { EmailProvider } from "../providers/email.provider";
import { DeliveryLog } from "../lib/delivery-log";
import { logger } from "../lib/logger";

interface MessageInput {
  to: string;

  // WhatsApp
  template?: string;
  variables?: any;

  // SMS + Email
  text?: string;

  // Email
  subject?: string;
  html?: string;

  metadata?: Record<string, any>;
}

export const Messaging = {
  async send(input: MessageInput) {
    const {
      to,
      template,
      variables,
      text,
      subject = "Notification",
      html = `<p>${text ?? ""}</p>`,
      metadata,
    } = input;

    // ---------------------------------------------------------
    // 1. WhatsApp
    // ---------------------------------------------------------
    try {
      const result = await WhatsAppProvider.send({
        to,
        template: template!,
        variables: variables!,
        text,        // fallback for SMS
        subject,     // fallback for Email
      });

      return result;
    } catch (err: any) {
      logger.warn("WhatsApp failed, falling back to SMS", {
        to,
        error: err.message,
      });

      await DeliveryLog.write({
        channel: "whatsapp",
        status: "FALLBACK",
        error: err.message,
        payload: input,
        metadata: { fallbackTo: "sms" },
      });
    }

    // ---------------------------------------------------------
    // 2. SMS
    // ---------------------------------------------------------
    try {
      const result = await SmsProvider.send({
        to,
        text: text!,
        subject, // needed for Email fallback
      });

      return result;
    } catch (err: any) {
      logger.warn("SMS failed, falling back to Email", {
        to,
        error: err.message,
      });

      await DeliveryLog.write({
        channel: "sms",
        status: "FALLBACK",
        error: err.message,
        payload: input,
        metadata: { fallbackTo: "email" },
      });
    }

    // ---------------------------------------------------------
    // 3. Email (final fallback)
    // ---------------------------------------------------------
    try {
      return await EmailProvider.send({
        to,
        subject,
        text: text ?? "",
        html,
        metadata,
      });
    } catch (err: any) {
      logger.error("All messaging channels failed", {
        to,
        error: err.message,
      });

      await DeliveryLog.write({
        channel: "email",
        status: "FAILED",
        error: err.message,
        payload: input,
      });

      throw err;
    }
  },
};

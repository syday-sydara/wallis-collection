// providers/messaging.ts
import { WhatsAppProvider } from "./whatsapp.provider";
import { SmsProvider } from "./sms.provider";
import { EmailProvider } from "./email.provider";
import { logger } from "../lib/logger";
import { DeliveryLog } from "../lib/delivery-log";
import { Correlation } from "../lib/correlation";

interface MessageInput {
  to: string;
  template?: string;
  variables?: any;
  text?: string;
  subject?: string;
}

export const Messaging = {
  async send(input: MessageInput) {
    const ctx = Correlation.get();

    // ---------------------------------------------------------
    // 1. Try WhatsApp first
    // ---------------------------------------------------------
    try {
      return await WhatsAppProvider.send({
        to: input.to,
        template: input.template!,
        variables: input.variables!,
        text: input.text,
        subject: input.subject,
      });
    } catch (err: any) {
      logger.warn("WhatsApp failed, falling back to SMS", {
        ...ctx,
        to: input.to,
        error: err.message,
      });

      await DeliveryLog.write({
        channel: "whatsapp",
        status: "FALLBACK",
        error: err.message,
        payload: input,
        metadata: { fallbackTo: "sms" },
        ...ctx,
      });
    }

    // ---------------------------------------------------------
    // 2. Try SMS second
    // ---------------------------------------------------------
    try {
      return await SmsProvider.send({
        to: input.to,
        text: input.text ?? "Notification",
        subject: input.subject,
      });
    } catch (err: any) {
      logger.warn("SMS failed, falling back to Email", {
        ...ctx,
        to: input.to,
        error: err.message,
      });

      await DeliveryLog.write({
        channel: "sms",
        status: "FALLBACK",
        error: err.message,
        payload: input,
        metadata: { fallbackTo: "email" },
        ...ctx,
      });
    }

    // ---------------------------------------------------------
    // 3. Try Email last
    // ---------------------------------------------------------
    try {
      return await EmailProvider.send({
        to: input.to,
        subject: input.subject ?? "Notification",
        html: input.text ?? "",
        text: input.text ?? "",
      });
    } catch (err: any) {
      logger.error("All messaging channels failed", {
        ...ctx,
        to: input.to,
        error: err.message,
      });

      await DeliveryLog.write({
        channel: "email",
        status: "FAILED",
        error: err.message,
        payload: input,
        metadata: { finalFailure: true },
        ...ctx,
      });

      throw err;
    }
  },
};

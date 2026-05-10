// services/messaging.service.ts
import { WhatsAppProvider } from "@/providers/whatsapp.provider";
import { SmsProvider } from "@/providers/sms.provider";
import { EmailProvider } from "@/providers/email.provider";
import { DeliveryLog } from "@/lib/delivery-log";
import { logger } from "@/lib/logger";
import { Correlation } from "@/lib/correlation";

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
  /**
   * Nigeria‑first messaging fallback:
   * 1. WhatsApp (primary)
   * 2. SMS (fallback)
   * 3. Email (final fallback)
   *
   * Guarantees:
   * - correlation propagation
   * - structured delivery logs
   * - deterministic fallback chain
   * - no silent failures
   */
  async send(input: MessageInput) {
    const ctx = Correlation.get();

    const {
      to,
      template,
      variables,
      text,
      subject = "Notification",
      html = text ? `<p>${text}</p>` : "<p></p>",
      metadata,
    } = input;

    // ---------------------------------------------------------
    // 1. WhatsApp (primary)
    // ---------------------------------------------------------
    try {
      const result = await WhatsAppProvider.send({
        to,
        template: template!,
        variables: variables!,
        text,
        subject,
        metadata,
      });

      return result;
    } catch (err: any) {
      logger.warn("[Messaging] WhatsApp failed → SMS fallback", {
        ...ctx,
        to,
        error: err.message,
      });

      await DeliveryLog.write({
        channel: "whatsapp",
        status: "FALLBACK",
        error: err.message,
        payload: input,
        metadata: { fallbackTo: "sms", ...metadata },
        ...ctx,
      });
    }

    // ---------------------------------------------------------
    // 2. SMS (fallback)
    // ---------------------------------------------------------
    try {
      const result = await SmsProvider.send({
        to,
        text: text ?? "Notification",
        subject,
        metadata,
      });

      return result;
    } catch (err: any) {
      logger.warn("[Messaging] SMS failed → Email fallback", {
        ...ctx,
        to,
        error: err.message,
      });

      await DeliveryLog.write({
        channel: "sms",
        status: "FALLBACK",
        error: err.message,
        payload: input,
        metadata: { fallbackTo: "email", ...metadata },
        ...ctx,
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
      logger.error("[Messaging] All channels failed", {
        ...ctx,
        to,
        error: err.message,
      });

      await DeliveryLog.write({
        channel: "email",
        status: "FAILED",
        error: err.message,
        payload: input,
        metadata: { finalFailure: true, ...metadata },
        ...ctx,
      });

      throw err;
    }
  },
};

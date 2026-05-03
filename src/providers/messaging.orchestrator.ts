import { WhatsAppProvider } from "./whatsapp.provider";
import { SmsProvider } from "./sms.provider";
import { EmailProvider } from "./email.provider";
import { logger } from "../lib/logger";

interface MessageInput {
  to: string;
  template?: string;
  variables?: any;
  text?: string;
  subject?: string;
}

export const Messaging = {
  async send(input: MessageInput) {
    // 1. Try WhatsApp first
    try {
      return await WhatsAppProvider.send({
        to: input.to,
        template: input.template!,
        variables: input.variables!,
      });
    } catch (err) {
      logger.warn("WhatsApp failed, falling back to SMS", {
        to: input.to,
        error: err.message,
      });
    }

    // 2. Try SMS second
    try {
      return await SmsProvider.send({
        to: input.to,
        text: input.text!,
      });
    } catch (err) {
      logger.warn("SMS failed, falling back to Email", {
        to: input.to,
        error: err.message,
      });
    }

    // 3. Try Email last
    try {
      return await EmailProvider.send({
        to: input.to,
        subject: input.subject!,
        html: input.text!,
        text: ""
      });
    } catch (err) {
      logger.error("All messaging channels failed", {
        to: input.to,
        error: err.message,
      });
      throw err;
    }
  },
};

import { prisma } from "../lib/prisma";

export type DeliveryStatus =
  | "SENT"
  | "FAILED"
  | "FALLBACK"
  | "RETRY"
  | "QUEUED";

interface LogInput {
  channel: "whatsapp" | "sms" | "email";
  status: DeliveryStatus;
  messageId?: string;
  error?: string;
  payload?: any;
  metadata?: any;
}

export const DeliveryLog = {
  async write(input: LogInput) {
    return prisma.messageDeliveryLog.create({
      data: {
        channel: input.channel,
        status: input.status,
        messageId: input.messageId ?? null,
        error: input.error ?? null,
        payload: input.payload ?? null,
        metadata: input.metadata ?? null,
      },
    });
  },
};

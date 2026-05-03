// services/whatsapp-session-manager.ts
import { prisma } from "../lib/prisma";
import { normalizePhone } from "../utils/phone";

export class WhatsAppSessionManager {
  /**
   * Get or create a WhatsApp session for a phone number.
   * Ensures:
   *  - phone is normalized
   *  - session is unique (via phoneNormalized)
   *  - session is linked to a customer
   */
  static async getOrCreateSession(phone: string) {
    const normalized = normalizePhone(phone);
    if (!normalized) throw new Error("Invalid phone number");

    // 1. Try to find existing session
    let session = await prisma.whatsAppSession.findUnique({
      where: { phoneNormalized: normalized },
    });

    if (session) return session;

    // 2. Find or create customer
    const customer = await prisma.customer.upsert({
      where: { phone: normalized },
      update: {},
      create: { phone: normalized },
    });

    // 3. Create new session
    session = await prisma.whatsAppSession.create({
      data: {
        phone: normalized,
        phoneNormalized: normalized,
        customerId: customer.id,
        lastInboundAt: null,
        lastOutboundAt: null,
      },
    });

    return session;
  }

  /**
   * Attach a session to a customer if not already linked.
   * Useful when a customer updates their profile or places an order.
   */
  static async attachSessionToCustomer(sessionId: string, customerId: string) {
    return prisma.whatsAppSession.update({
      where: { id: sessionId },
      data: { customerId },
    });
  }

  /**
   * Record an inbound message:
   *  - creates WhatsAppMessage
   *  - updates lastInboundAt
   */
  static async recordInboundMessage(
    sessionId: string,
    body: string,
    rawPayload?: any
  ) {
    const message = await prisma.whatsAppMessage.create({
      data: {
        sessionId,
        direction: "INBOUND",
        body,
        status: "RECEIVED",
        rawPayload: rawPayload ?? {},
      },
    });

    await prisma.whatsAppSession.update({
      where: { id: sessionId },
      data: { lastInboundAt: new Date() },
    });

    return message;
  }

  /**
   * Record an outbound message:
   *  - creates WhatsAppMessage
   *  - updates lastOutboundAt
   *  - returns messageId for worker
   */
  static async recordOutboundMessage(
    sessionId: string,
    body: string,
    rawPayload?: any
  ) {
    const message = await prisma.whatsAppMessage.create({
      data: {
        sessionId,
        direction: "OUTBOUND",
        body,
        status: "QUEUED",
        rawPayload: rawPayload ?? {},
      },
    });

    await prisma.whatsAppSession.update({
      where: { id: sessionId },
      data: { lastOutboundAt: new Date() },
    });

    return message;
  }

  /**
   * Update message delivery status (used by worker + webhook)
   */
  static async updateMessageStatus(messageId: string, status: string) {
    return prisma.whatsAppMessage.update({
      where: { id: messageId },
      data: { status },
    });
  }
}

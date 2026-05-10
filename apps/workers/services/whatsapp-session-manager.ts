// services/whatsapp-session-manager.ts
import { prisma } from "@/lib/prisma";
import { normalizePhone } from "@/utils/phone";

export class WhatsAppSessionManager {
  /**
   * Get or create a WhatsApp session for a phone number.
   * Guarantees:
   * - strict phone normalization
   * - unique session per phoneNormalized
   * - customer auto‑creation
   */
  static async getOrCreateSession(phone: string) {
    const normalized = normalizePhone(phone);
    if (!normalized) throw new Error("Invalid phone number");

    // 1. Try existing session
    const existing = await prisma.whatsAppSession.findUnique({
      where: { phoneNormalized: normalized },
    });
    if (existing) return existing;

    // 2. Resolve customer (deduplicated)
    const customer = await this.resolveCustomer(normalized);

    // 3. Create session (deduplicated)
    return this.createSession(normalized, customer.id);
  }

  /**
   * Attach a session to a customer.
   */
  static async attachSessionToCustomer(sessionId: string, customerId: string) {
    return prisma.whatsAppSession.update({
      where: { id: sessionId },
      data: { customerId },
    });
  }

  /**
   * Record inbound message.
   */
  static async recordInboundMessage(sessionId: string, body: string, rawPayload?: any) {
    return this.recordMessage(sessionId, "INBOUND", body, "RECEIVED", rawPayload, {
      lastInboundAt: new Date(),
    });
  }

  /**
   * Record outbound message.
   */
  static async recordOutboundMessage(sessionId: string, body: string, rawPayload?: any) {
    return this.recordMessage(sessionId, "OUTBOUND", body, "QUEUED", rawPayload, {
      lastOutboundAt: new Date(),
    });
  }

  /**
   * Update message delivery status.
   */
  static async updateMessageStatus(messageId: string, status: string) {
    return prisma.whatsAppMessage.update({
      where: { id: messageId },
      data: { status },
    });
  }

  // ------------------------------------------------------
  // INTERNAL HELPERS (deduplicated logic)
  // ------------------------------------------------------

  private static async resolveCustomer(normalized: string) {
    return prisma.customer.upsert({
      where: { phoneNormalized: normalized },
      update: {},
      create: { phone: normalized, phoneNormalized: normalized },
    });
  }

  private static async createSession(normalized: string, customerId: string) {
    return prisma.whatsAppSession.create({
      data: {
        phone: normalized,
        phoneNormalized: normalized,
        customerId,
        lastInboundAt: null,
        lastOutboundAt: null,
      },
    });
  }

  private static async recordMessage(
    sessionId: string,
    direction: "INBOUND" | "OUTBOUND",
    body: string,
    status: string,
    rawPayload: any,
    sessionUpdate: Record<string, any>
  ) {
    const message = await prisma.whatsAppMessage.create({
      data: {
        sessionId,
        direction,
        body,
        status,
        rawPayload: rawPayload ?? {},
      },
    });

    await prisma.whatsAppSession.update({
      where: { id: sessionId },
      data: sessionUpdate,
    });

    return message;
  }
}

// services/order.service.ts
import { prisma } from "@/lib/prisma";
import { normalizePhone } from "@/utils/phone";
import { WhatsAppSessionManager } from "@/services/whatsapp-session-manager";
import { OrderProducer } from "@/producers/order.producer";
import { Correlation } from "@/lib/correlation";
import { logger } from "@/lib/logger";

export class OrderService {
  /**
   * Create order and auto‑attach WhatsApp session.
   * Guarantees:
   * - strict phone normalization
   * - consistent session attachment
   * - typed order.created event
   */
  static async createOrder(input: {
    customerId?: string;
    phone?: string;
    sessionId?: string;
    totalAmount: number;
    currency: string;
    notes?: string;
  }) {
    const ctx = Correlation.get();

    // 1. Normalize phone (if provided)
    const normalizedPhone = input.phone
      ? normalizePhone(input.phone)
      : null;

    if (input.phone && !normalizedPhone) {
      throw new Error("Invalid phone number");
    }

    // 2. Resolve WhatsApp session
    let session = null;

    if (input.sessionId) {
      session = await prisma.whatsAppSession.findUnique({
        where: { id: input.sessionId },
      });
    } else if (normalizedPhone) {
      session = await WhatsAppSessionManager.getOrCreateSession(normalizedPhone);
    }

    // 3. Resolve customer
    const customerId =
      input.customerId ??
      session?.customerId ??
      null;

    // 4. Create order
    const order = await prisma.order.create({
      data: {
        customerId,
        phone: normalizedPhone,
        phoneNormalized: normalizedPhone,
        totalAmount: input.totalAmount,
        currency: input.currency,
        notes: input.notes ?? null,
        whatsAppSessionId: session?.id ?? null,
      },
    });

    // 5. Emit event
    await OrderProducer.orderCreated({
      orderId: order.id,
      customerId: order.customerId ?? undefined,
      sessionId: session?.id,
      customerPhone: normalizedPhone ?? undefined,
      timestamp: new Date(),
      ...ctx,
    });

    logger.info("[ORDER] Created order", {
      ...ctx,
      orderId: order.id,
      customerId: order.customerId,
      sessionId: session?.id,
    });

    return order;
  }

  /**
   * Confirm order and ensure WhatsApp session is attached.
   * Guarantees:
   * - session attached if possible
   * - typed order.confirmed event
   */
  static async confirmOrder(orderId: string, actor: string) {
    const ctx = Correlation.get();

    // 1. Load order + session
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { whatsAppSession: true },
    });

    if (!order) throw new Error("Order not found");

    const normalizedPhone =
      order.phoneNormalized ??
      (order.phone ? normalizePhone(order.phone) : null);

    // 2. Ensure session exists
    let session = order.whatsAppSession;

    if (!session && normalizedPhone) {
      session = await WhatsAppSessionManager.getOrCreateSession(normalizedPhone);
    }

    // 3. Attach session to order if missing
    if (!order.whatsAppSessionId && session) {
      await prisma.order.update({
        where: { id: orderId },
        data: { whatsAppSessionId: session.id },
      });
    }

    // 4. Emit event
    await OrderProducer.orderConfirmed({
      orderId,
      actor,
      sessionId: session?.id,
      customerPhone: normalizedPhone ?? undefined,
      timestamp: new Date(),
      ...ctx,
    });

    logger.info("[ORDER] Confirmed order", {
      ...ctx,
      orderId,
      actor,
      sessionId: session?.id,
    });

    return order;
  }
}

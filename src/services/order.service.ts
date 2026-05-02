// services/order.service.ts
import { prisma } from "../lib/prisma";
import { normalizePhone } from "../utils/phone";
import { WhatsAppSessionManager } from "./whatsapp-session-manager";
import { OrderProducer } from "../producers/order.producer";

export class OrderService {
  /**
   * Create order and auto‑attach WhatsApp session
   */
  static async createOrder(input: {
    customerId?: string;
    phone?: string;
    sessionId?: string;
    totalAmount: number;
    currency: string;
    notes?: string;
  }) {
    // ------------------------------------------------------
    // 1. Normalize phone
    // ------------------------------------------------------
    const normalizedPhone = input.phone ? normalizePhone(input.phone) : null;

    // ------------------------------------------------------
    // 2. Resolve WhatsApp session
    // ------------------------------------------------------
    let session = null;

    if (input.sessionId) {
      session = await prisma.whatsAppSession.findUnique({
        where: { id: input.sessionId },
      });
    } else if (normalizedPhone) {
      session = await WhatsAppSessionManager.getOrCreateSession(normalizedPhone);
    }

    // ------------------------------------------------------
    // 3. Resolve customer
    // ------------------------------------------------------
    const customerId =
      input.customerId ??
      session?.customerId ??
      null;

    // ------------------------------------------------------
    // 4. Create order
    // ------------------------------------------------------
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

    // ------------------------------------------------------
    // 5. Emit event
    // ------------------------------------------------------
    await OrderProducer.orderCreated({
      orderId: order.id,
      customerId: order.customerId ?? undefined,
      sessionId: session?.id,
      customerPhone: normalizedPhone ?? undefined,
      timestamp: new Date(),
    });

    return order;
  }

  /**
   * Confirm order and ensure WhatsApp session is attached
   */
  static async confirmOrder(orderId: string, actor: string) {
    // ------------------------------------------------------
    // 1. Load order + session
    // ------------------------------------------------------
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { whatsAppSession: true },
    });

    if (!order) throw new Error("Order not found");

    const normalizedPhone = order.phone ? normalizePhone(order.phone) : null;

    // ------------------------------------------------------
    // 2. Ensure session exists
    // ------------------------------------------------------
    let session = order.whatsAppSession;

    if (!session && normalizedPhone) {
      session = await WhatsAppSessionManager.getOrCreateSession(normalizedPhone);
    }

    // ------------------------------------------------------
    // 3. Attach session to order if missing
    // ------------------------------------------------------
    if (!order.whatsAppSessionId && session) {
      await prisma.order.update({
        where: { id: orderId },
        data: { whatsAppSessionId: session.id },
      });
    }

    // ------------------------------------------------------
    // 4. Emit event
    // ------------------------------------------------------
    await OrderProducer.orderConfirmed({
      orderId,
      actor,
      sessionId: session?.id,
      customerPhone: normalizedPhone ?? undefined,
      timestamp: new Date(),
    });

    return order;
  }
}

// services/timeline-aggregator.ts
import { prisma } from "../../lib/prisma";
import type { TimelineEntry } from "../../domain/timeline";
import { TimelineIdentityResolver } from "./identity-resolver";

export class TimelineAggregator {
  /**
   * Aggregate all customer activity into a unified timeline.
   */
  static async getTimeline(input: {
    customerId?: string;
    phone?: string;
    sessionId?: string;
  }): Promise<TimelineEntry[]> {
    // ------------------------------------------------------
    // 1. Resolve identity (canonical)
    // ------------------------------------------------------
    const { customerId, phoneNormalized, sessionId } =
      await TimelineIdentityResolver.resolve(input);

    // ------------------------------------------------------
    // 2. Fetch all timeline sources
    // ------------------------------------------------------
    const [
      orders,
      payments,
      orderStatusHistory,
      messages,
      smsMessages,
      reservations,
      auditLogs,
    ] = await Promise.all([
      prisma.order.findMany({
        where: {
          OR: [
            { customerId },
            { phoneNormalized },
            { whatsAppSession: { phoneNormalized } },
          ],
        },
        include: { whatsAppSession: true },
        orderBy: { createdAt: "desc" },
      }),

      prisma.payment.findMany({
        where: {
          order: {
            OR: [
              { customerId },
              { phoneNormalized },
              { whatsAppSession: { phoneNormalized } },
            ],
          },
        },
        orderBy: { createdAt: "desc" },
      }),

      prisma.orderStatusHistory.findMany({
        where: {
          order: {
            OR: [
              { customerId },
              { phoneNormalized },
              { whatsAppSession: { phoneNormalized } },
            ],
          },
        },
        orderBy: { createdAt: "desc" },
      }),

      prisma.whatsAppMessage.findMany({
        where: {
          session: {
            OR: [{ customerId }, { phoneNormalized }],
          },
        },
        include: { session: true },
        orderBy: { createdAt: "desc" },
      }),

      prisma.smsMessage.findMany({
        where: { to: phoneNormalized ?? undefined },
        orderBy: { createdAt: "desc" },
      }),

      prisma.stockReservation.findMany({
        where: {
          order: {
            OR: [
              { customerId },
              { phoneNormalized },
              { whatsAppSession: { phoneNormalized } },
            ],
          },
        },
        orderBy: { createdAt: "desc" },
      }),

      prisma.auditLog.findMany({
        where: {
          OR: [
            { entityId: customerId ?? "" },
            { entityId: phoneNormalized ?? "" },
          ],
        },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    // ------------------------------------------------------
    // 3. Normalize into TimelineEntry[]
    // ------------------------------------------------------
    const timeline: TimelineEntry[] = [];

    // ---- Orders ----
    for (const o of orders) {
      timeline.push({
        id: o.id,
        type: "order",
        timestamp: o.createdAt,
        customerId: o.customerId ?? undefined,
        phoneNormalized: o.phoneNormalized ?? undefined,
        sessionId: o.whatsAppSessionId ?? undefined,
        orderId: o.id,
        title: `Order created`,
        description: `Total: ${o.totalAmount} ${o.currency}`,
        icon: "🛒",
        data: o,
      });
    }

    // ---- Payments ----
    for (const p of payments) {
      timeline.push({
        id: p.id,
        type: "payment",
        timestamp: p.createdAt,
        customerId,
        phoneNormalized,
        orderId: p.orderId,
        paymentId: p.id,
        title: `Payment ${p.status.toLowerCase()}`,
        description: `Amount: ${p.amount} ${p.currency}`,
        icon: "💳",
        data: p,
      });
    }

    // ---- Order Status History ----
    for (const h of orderStatusHistory) {
      timeline.push({
        id: h.id,
        type: "order_status",
        timestamp: h.createdAt,
        customerId,
        phoneNormalized,
        orderId: h.orderId,
        title: `Order status → ${h.status}`,
        description: h.reason ?? undefined,
        icon: "🔄",
        data: h,
      });
    }

    // ---- WhatsApp Messages ----
    for (const m of messages) {
      timeline.push({
        id: m.id,
        type: "whatsapp_message",
        timestamp: m.createdAt,
        customerId: m.session.customerId ?? undefined,
        phoneNormalized: m.session.phoneNormalized,
        sessionId: m.sessionId,
        title: m.direction === "INBOUND" ? "Customer message" : "Message sent",
        description: m.body,
        icon: m.direction === "INBOUND" ? "💬" : "📤",
        data: m,
      });
    }

    // ---- SMS Messages ----
    for (const s of smsMessages) {
      timeline.push({
        id: s.id,
        type: "sms_message",
        timestamp: s.createdAt,
        phoneNormalized: s.to,
        title: "SMS sent",
        description: s.text,
        icon: "📱",
        data: s,
      });
    }

    // ---- Stock Reservations ----
    for (const r of reservations) {
      timeline.push({
        id: r.id,
        type: "stock_reservation",
        timestamp: r.createdAt,
        orderId: r.orderId ?? undefined,
        reservationId: r.id,
        title: `Stock ${r.status.toLowerCase()}`,
        description: `Qty: ${r.quantity}`,
        icon: "📦",
        data: r,
      });
    }

    // ---- Audit Logs ----
    for (const a of auditLogs) {
      timeline.push({
        id: a.id,
        type: "audit_log",
        timestamp: a.createdAt,
        customerId,
        phoneNormalized,
        title: `Audit: ${a.action}`,
        description: a.metadata ? JSON.stringify(a.metadata) : undefined,
        icon: "📝",
        data: a,
      });
    }

    // ------------------------------------------------------
    // 4. Sort newest → oldest
    // ------------------------------------------------------
    timeline.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    return timeline;
  }
}

// services/timeline/enrichers/order.enricher.ts
import { TimelineEntry } from "../../../domain/timeline";

export class OrderEnricher {
  static enrich(order): TimelineEntry {
    return {
      id: order.id,
      type: "order",
      timestamp: order.createdAt,
      customerId: order.customerId ?? undefined,
      phoneNormalized: order.phoneNormalized ?? undefined,
      sessionId: order.whatsAppSessionId ?? undefined,
      orderId: order.id,
      title: `Order #${order.id} created`,
      description: `Total: ${(order.totalAmount / 100).toFixed(2)} ${order.currency}`,
      icon: "🛒",
      data: { ...order, payments: undefined, reservations: undefined },
    };
  }
}

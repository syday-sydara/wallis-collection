import { TimelineEntry } from "../../../domain/timeline";

export class PaymentEnricher {
  static enrich(p): TimelineEntry {
    return {
      id: p.id,
      type: "payment",
      timestamp: p.createdAt,
      customerId: p.order?.customerId ?? undefined,
      phoneNormalized: p.order?.phoneNormalized ?? undefined,
      orderId: p.orderId,
      paymentId: p.id,
      title: `Payment ${p.status.toLowerCase()}`,
      description: `Amount: ${(p.amount / 100).toFixed(2)} ${p.currency}`,
      icon: "💳",
      data: p,
    };
  }
}

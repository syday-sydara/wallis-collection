import { TimelineEntry } from "../../../domain/timeline";

export class ReservationEnricher {
  static enrich(r): TimelineEntry {
    return {
      id: r.id,
      type: "stock_reservation",
      timestamp: r.createdAt,
      orderId: r.orderId,
      reservationId: r.id,
      title: `Stock ${r.status.toLowerCase()}`,
      description: `Qty: ${r.quantity}`,
      icon: "📦",
      data: r,
    };
  }
}

import { TimelineEntry } from "../../../domain/timeline";

export class WhatsAppEnricher {
  static enrich(m): TimelineEntry {
    return {
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
    };
  }
}

// domain/timeline.ts

export type TimelineEntryType =
  | "order"
  | "payment"
  | "order_status"
  | "whatsapp_message"
  | "sms_message"
  | "stock_reservation"
  | "audit_log";

export interface TimelineEntry {
  id: string;
  type: TimelineEntryType;
  timestamp: Date;

  // Correlation metadata
  customerId?: string;
  phoneNormalized?: string;
  sessionId?: string;
  orderId?: string;
  paymentId?: string;
  reservationId?: string;

  // Optional: where the event originated
  source?: "system" | "customer" | "agent" | "automation" | "webhook";

  // Enriched, frontend‑ready metadata
  title: string;
  description?: string;
  icon?: string;
  data: Record<string, any>;
}

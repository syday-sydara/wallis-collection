// domain/timeline.ts

export interface TimelineEntry {
  id: string;
  type: string;               // "order" | "payment" | "whatsapp_message" | ...
  timestamp: Date;

  // Correlation metadata
  customerId?: string;
  phoneNormalized?: string;
  sessionId?: string;
  orderId?: string;
  paymentId?: string;
  reservationId?: string;

  // Enriched, frontend‑ready metadata
  title: string;
  description?: string;
  icon?: string;              // optional UI hint
  data: Record<string, any>;  // raw + enriched
}

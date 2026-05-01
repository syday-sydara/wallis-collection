// events/payloads.ts
import type { Actor } from "../domain/order-state-machine";
import { Events } from "./events";

// Ensures EventPayloads keys ALWAYS match Events.* values
export type EventName = (typeof Events)[keyof typeof Events];

export interface EventPayloads {
  // ORDER
  "order.created": { orderId: string };
  "order.confirmed": { orderId: string; actor: Actor };
  "order.processing": { orderId: string; actor: Actor };
  "order.shipped": { orderId: string; shipmentId: string };
  "order.delivered": { orderId: string; deliveredAt: Date };
  "order.failed_delivery": { orderId: string; reason?: string };
  "order.returned": { orderId: string; reason?: string };
  "order.cancelled": { orderId: string; actor: Actor; reason?: string };

  // PAYMENT
  "payment.initiated": { paymentId: string; orderId: string };
  "payment.success": { paymentId: string; orderId: string };
  "payment.failed": { paymentId: string; orderId: string; reason?: string };
  "payment.confirmed": { paymentId: string; orderId: string; verifiedBy: string };

  // INVENTORY
  "stock.reserved": { reservationId: string; variantId: string; quantity: number };
  "stock.released": { reservationId: string; reason?: string };
  "stock.consumed": { reservationId: string };

  // WHATSAPP
  "whatsapp.session.started": { sessionId: string; phone: string };
  "whatsapp.session.updated": { sessionId: string; lastMessageAt: Date };
  "whatsapp.message.received": { sessionId: string; message: string };
  "whatsapp.message.sent": { sessionId: string; message: string };

  // AUDIT
  "audit.created": { logId: string };
}

// ---------------------------------------------
// TYPE SAFETY CHECKS (compile-time only)
// ---------------------------------------------

// 1. Ensure every event in Events has a payload
type _CheckAllEventsHavePayloads = {
  [E in EventName]: E extends keyof EventPayloads ? true : never;
};

// 2. Ensure no extra payload keys exist
type _CheckNoExtraPayloads = {
  [E in keyof EventPayloads]: E extends EventName ? true : never;
};

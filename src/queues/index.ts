// queues/index.ts

// Core
export * from "./core/connection";

// Domain queues
export * from "./domain/audit.queue";
export * from "./domain/order.queue";
export * from "./domain/payment.queue";
export * from "./domain/inventory.queue";
export * from "./domain/inventory.reserve.queue";
export * from "./domain/reservation.expiry.queue";
export * from "./domain/stock.reconciliation.queue";

// Messaging queues
export * from "./messaging/email.dlq.queue";
export * from "./messaging/notification.queue";
export * from "./messaging/sms.dlq.queue";
export * from "./messaging/whatsapp.dlq.queue";
export * from "./messaging/whatsapp.outbound.queue";

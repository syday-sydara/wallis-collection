import { http } from "./http";
import {
  OrderSchema,
  OrderListSchema,
  PaymentSchema,
  PaymentListSchema,
  ProductSchema,
  ProductListSchema,
  StockReservationSchema,
  ReservationListSchema,
  ShipmentSchema,
  ShipmentListSchema,
  WhatsAppOrderSchema,
  WhatsAppOrderListSchema,
  AuditLogSchema,
  AuditLogListSchema,
  QueueStatsListSchema,
  DLQEntrySchema,
  DLQListSchema,
  MessageLogSchema,
  MessageLogListSchema,
} from "@/schemas";

export const adminApi = {
  // ------------------------------------------------------
  // PRODUCTS
  // ------------------------------------------------------
  products: {
    list: () =>
      http.get("/api/admin/products", ProductListSchema),

    get: (id: string) =>
      http.get(`/api/admin/products/${id}`, ProductSchema),

    archive: (id: string) =>
      http.post(`/api/admin/products/${id}/archive`, {}, ProductSchema),

    unarchive: (id: string) =>
      http.post(`/api/admin/products/${id}/unarchive`, {}, ProductSchema),
  },

  // ------------------------------------------------------
  // ORDERS
  // ------------------------------------------------------
  orders: {
    list: () =>
      http.get("/api/admin/orders", OrderListSchema),

    get: (id: string) =>
      http.get(`/api/admin/orders/${id}`, OrderSchema),

    updateStatus: (id: string, status: string) =>
      http.put(`/api/admin/orders/${id}/status`, { status }, OrderSchema),

    timeline: (id: string) =>
      http.get(`/api/admin/orders/${id}/timeline`, MessageLogListSchema),
  },

  // ------------------------------------------------------
  // PAYMENTS
  // ------------------------------------------------------
  payments: {
    list: () =>
      http.get("/api/admin/payments", PaymentListSchema),

    get: (id: string) =>
      http.get(`/api/admin/payments/${id}`, PaymentSchema),

    verify: (id: string) =>
      http.post(`/api/admin/payments/${id}/verify`, {}, PaymentSchema),

    refund: (id: string) =>
      http.post(`/api/admin/payments/${id}/refund`, {}, PaymentSchema),
  },

  // ------------------------------------------------------
  // RESERVATIONS
  // ------------------------------------------------------
  reservations: {
    list: () =>
      http.get("/api/admin/reservations", ReservationListSchema),

    get: (id: string) =>
      http.get(`/api/admin/reservations/${id}`, StockReservationSchema),

    cancel: (id: string) =>
      http.post(`/api/admin/reservations/${id}/cancel`, {}, StockReservationSchema),

    extend: (id: string, minutes: number) =>
      http.post(
        `/api/admin/reservations/${id}/extend`,
        { minutes },
        StockReservationSchema
      ),
  },

  // ------------------------------------------------------
  // SHIPMENTS
  // ------------------------------------------------------
  shipments: {
    list: () =>
      http.get("/api/admin/shipments", ShipmentListSchema),

    get: (id: string) =>
      http.get(`/api/admin/shipments/${id}`, ShipmentSchema),

    updateStatus: (id: string, status: string) =>
      http.put(`/api/admin/shipments/${id}/status`, { status }, ShipmentSchema),
  },

  // ------------------------------------------------------
  // WHATSAPP ORDERS
  // ------------------------------------------------------
  whatsapp: {
    list: () =>
      http.get("/api/admin/whatsapp/orders", WhatsAppOrderListSchema),

    get: (id: string) =>
      http.get(`/api/admin/whatsapp/orders/${id}`, WhatsAppOrderSchema),

    convertToOrder: (id: string) =>
      http.post(`/api/admin/whatsapp/orders/${id}/convert`, {}, WhatsAppOrderSchema),

    archive: (id: string) =>
      http.post(`/api/admin/whatsapp/orders/${id}/archive`, {}, WhatsAppOrderSchema),
  },

  // ------------------------------------------------------
  // AUDIT LOGS
  // ------------------------------------------------------
  audit: {
    list: () =>
      http.get("/api/admin/audit", AuditLogListSchema),

    get: (id: string) =>
      http.get(`/api/admin/audit/${id}`, AuditLogSchema),
  },

  // ------------------------------------------------------
  // QUEUE STATS
  // ------------------------------------------------------
  queue: {
    stats: () =>
      http.get("/api/admin/queue/stats", QueueStatsListSchema),
  },

  // ------------------------------------------------------
  // DLQ
  // ------------------------------------------------------
  dlq: {
    list: () =>
      http.get("/api/admin/dlq", DLQListSchema),

    get: (id: string) =>
      http.get(`/api/admin/dlq/${id}`, DLQEntrySchema),

    retry: (id: string) =>
      http.post(`/api/admin/dlq/${id}/retry`, {}, DLQEntrySchema),
  },

  // ------------------------------------------------------
  // MESSAGE LOGS
  // ------------------------------------------------------
  messages: {
    list: () =>
      http.get("/api/admin/messages", MessageLogListSchema),

    get: (id: string) =>
      http.get(`/api/admin/messages/${id}`, MessageLogSchema),
  },
};

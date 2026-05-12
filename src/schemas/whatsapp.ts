import { z } from "zod";

export const WhatsAppOrderStatusEnum = z.enum([
  "PENDING",
  "CONFIRMED",
  "PAID",
  "CANCELLED",
]);

export const WhatsAppPaymentMethodEnum = z.enum([
  "BANK_TRANSFER",
  "CASH_ON_DELIVERY",
]);

export const DeliveryMethodEnum = z.enum([
  "DELIVERY",
  "PICKUP",
]);

// -----------------------------------------------------
// ITEM
// -----------------------------------------------------
export const WhatsAppOrderItemSchema = z.object({
  id: z.string(),
  whatsappOrderId: z.string(),
  variantId: z.string(),
  quantity: z.number().int(),
  price: z.number().int(), // ← correct field
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

// -----------------------------------------------------
// ORDER
// -----------------------------------------------------
export const WhatsAppOrderSchema = z.object({
  id: z.string(),

  phoneNumber: z.string(),
  userId: z.string().nullable(),

  sessionId: z.string().nullable().optional(),

  status: WhatsAppOrderStatusEnum,

  addressLine1: z.string().nullable(),
  addressLine2: z.string().nullable(),
  city: z.string().nullable(),
  state: z.string().nullable(),
  lga: z.string().nullable(),
  landmark: z.string().nullable(),

  paymentMethod: WhatsAppPaymentMethodEnum.nullable().optional(),
  deliveryMethod: DeliveryMethodEnum.nullable().optional(),

  notes: z.string().nullable(),

  lastMessageAt: z.string().datetime().nullable(),
  lastInboundMessage: z.string().nullable().optional(),
  lastOutboundMessage: z.string().nullable().optional(),
  lastMessageDirection: z.enum(["inbound", "outbound"]).nullable().optional(),

  finalOrderId: z.string().nullable(),

  isArchived: z.boolean().optional(),
  isConverted: z.boolean().optional(),
  convertedAt: z.string().datetime().nullable().optional(),

  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),

  items: z.array(WhatsAppOrderItemSchema), // ← always present
});

export type WhatsAppOrder = z.infer<typeof WhatsAppOrderSchema>;
export type WhatsAppOrderItem = z.infer<typeof WhatsAppOrderItemSchema>;
export type WhatsAppOrderList = WhatsAppOrder[];

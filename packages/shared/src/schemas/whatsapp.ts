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

export const WhatsAppOrderItemSchema = z.object({
  id: z.string(),
  whatsappOrderId: z.string(),
  variantId: z.string(),
  quantity: z.number().int(),
  priceAtTime: z.number().int(),
  createdAt: z.string().datetime(),
});

export const WhatsAppOrderSchema = z.object({
  id: z.string(),
  phoneNumber: z.string(),
  userId: z.string().nullable(),
  status: WhatsAppOrderStatusEnum,

  addressLine1: z.string().nullable(),
  addressLine2: z.string().nullable(),
  city: z.string().nullable(),
  state: z.string().nullable(),
  lga: z.string().nullable(),
  landmark: z.string().nullable(),

  paymentMethod: WhatsAppPaymentMethodEnum.nullable(),
  deliveryMethod: DeliveryMethodEnum,

  notes: z.string().nullable(),
  lastMessageAt: z.string().datetime().nullable(),

  finalOrderId: z.string().nullable(),

  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),

  items: z.array(WhatsAppOrderItemSchema).optional(),
});

export type WhatsAppOrder = z.infer<typeof WhatsAppOrderSchema>;
export type WhatsAppOrderItem = z.infer<typeof WhatsAppOrderItemSchema>;

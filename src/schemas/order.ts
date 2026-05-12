import { z } from "zod";

// ---------------------------------------------
// ENUMS
// ---------------------------------------------
export const OrderStatusEnum = z.enum([
  "PENDING",
  "CONFIRMED",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
]);

export const PaymentStatusEnum = z.enum([
  "PENDING",
  "AWAITING_CONFIRMATION",
  "SUCCESS",
  "FAILED",
]);

export const OrderPaymentMethodEnum = z.enum([
  "BANK_TRANSFER",
  "CASH_ON_DELIVERY",
]);

// ---------------------------------------------
// ORDER ITEM
// ---------------------------------------------
export const OrderItemSchema = z.object({
  id: z.string(),
  orderId: z.string(),
  variantId: z.string(),
  quantity: z.number().int().positive(),
  price: z.number().int().nonnegative(), // ← correct field
});

// ---------------------------------------------
// ORDER
// ---------------------------------------------
export const OrderSchema = z.object({
  id: z.string(),

  userId: z.string().nullable(),
  phoneNumber: z.string(),

  addressLine1: z.string(),
  addressLine2: z.string().nullable(),
  city: z.string().nullable(),
  state: z.string(),
  lga: z.string().nullable(),
  landmark: z.string().nullable(),
  deliveryNote: z.string().nullable(),

  subtotal: z.number().int(),
  deliveryFee: z.number().int(),
  discount: z.number().int(),
  totalAmount: z.number().int(),

  currency: z.string(),

  paymentMethod: OrderPaymentMethodEnum,
  paymentStatus: PaymentStatusEnum,

  status: OrderStatusEnum,

  ipAddress: z.string().nullable(),
  userAgent: z.string().nullable(),

  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),

  items: z.array(OrderItemSchema),
});

export type Order = z.infer<typeof OrderSchema>;
export type OrderItem = z.infer<typeof OrderItemSchema>;
export type OrderList = Order[];

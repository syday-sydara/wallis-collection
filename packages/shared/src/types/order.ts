import { z } from "zod";

// ---------------------------------------------
// ORDER ITEM
// ---------------------------------------------
export const OrderItemSchema = z.object({
  id: z.string().min(1),
  variantId: z.string().min(1),
  quantity: z.number().int().positive(),
  price: z.number().int().nonnegative(), // ← matches Prisma
});

// ---------------------------------------------
// ORDER
// ---------------------------------------------
export const OrderSchema = z.object({
  id: z.string().min(1),

  status: z.enum([
    "PENDING",
    "CONFIRMED",
    "SHIPPED",
    "DELIVERED",
    "CANCELLED",
  ]),

  paymentStatus: z.enum([
    "PENDING",
    "AWAITING_CONFIRMATION",
    "SUCCESS",
    "FAILED",
  ]),

  paymentMethod: z.enum(["BANK_TRANSFER", "CASH_ON_DELIVERY"]),

  subtotal: z.number().int().nonnegative(),
  deliveryFee: z.number().int().nonnegative(),
  discount: z.number().int().nonnegative(),
  totalAmount: z.number().int().nonnegative(),

  currency: z.string().min(1),

  phoneNumber: z.string().min(1),

  addressLine1: z.string().min(1),
  addressLine2: z.string().nullable(),
  city: z.string().nullable(),
  state: z.string().min(1),
  lga: z.string().nullable(),
  landmark: z.string().nullable(),
  deliveryNote: z.string().nullable(),

  createdAt: z.string().datetime(),

  items: z.array(OrderItemSchema),
});

export type Order = z.infer<typeof OrderSchema>;
export type OrderItem = z.infer<typeof OrderItemSchema>;
export type OrderList = Order[];

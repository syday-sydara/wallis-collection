import { z } from "zod";

export const OrderStatusEnum = z.enum([
  "PENDING",
  "PROCESSING",
  "COMPLETED",
  "CANCELLED",
]);

export const PaymentStatusEnum = z.enum([
  "PENDING",
  "VERIFIED",
  "FAILED",
]);

export const OrdersSchema = z.object({
  id: z.string(), // cuid, not uuid

  userId: z.string().nullable(),

  phoneNumber: z
    .string()
    .regex(/^(\+234|0)[0-9]{10}$/, "Invalid Nigerian phone number format"),

  addressLine1: z.string(),
  addressLine2: z.string().nullable(),
  city: z.string().nullable(),
  state: z.string(),
  lga: z.string().nullable(),
  landmark: z.string().nullable(),
  deliveryNote: z.string().nullable(),

  subtotal: z.number(),
  deliveryFee: z.number(),
  discount: z.number(),
  totalAmount: z.number(),

  currency: z.string(),

  paymentMethod: z.string(),
  paymentStatus: PaymentStatusEnum,
  status: OrderStatusEnum,

  ipAddress: z.string().nullable(),
  userAgent: z.string().nullable(),

  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

import { z } from "zod";

export const orderSchema = z.object({
  id: z.string().optional(),

  email: z.string().email(),
  phone: z.string(),
  fullName: z.string(),

  subtotal: z.number(),
  shippingCost: z.number(),
  discountAmount: z.number().default(0),
  total: z.number(),
  refundedAmount: z.number().default(0),

  currency: z.enum(["NGN", "USD", "GBP"]).default("NGN"),
  paymentMethod: z.enum(["CARD", "TRANSFER", "CASH"]),
  orderStatus: z.enum([
    "CREATED",
    "PENDING_PAYMENT",
    "REVIEW",
    "CONFIRMED",
    "PACKING",
    "SHIPPED",
    "DELIVERED",
    "RETURN_REQUESTED",
    "RETURNED",
    "FAILED_DELIVERY",
    "CANCELLED",
  ]).default("CREATED"),

  paymentStatus: z.enum([
    "PENDING",
    "SUCCESS",
    "FAILED",
    "REFUNDED",
    "REVIEW",
    "CHARGEBACK",
    "EXPIRED",
    "PARTIAL",
  ]).default("PENDING"),

  paymentProvider: z.enum(["PAYSTACK", "MONNIFY", "BANK_TRANSFER"]).nullable().optional(),

  fraudScore: z.number().default(0),

  riskScore: z.number().nullable().optional(),
  riskTriggeredRules: z.array(z.string()).default([]),
  riskLevel: z.string().nullable().optional(),
  riskContextSnapshot: z.any().optional(),

  shippingType: z.enum(["STANDARD", "EXPRESS", "PICKUP"]),
  shippingAddress: z.any(),

  deliveryNotes: z.string().nullable().optional(),
  deliveredAt: z.date().nullable().optional(),

  isPaid: z.boolean().default(false),

  trackingNumber: z.string().nullable().optional(),
  carrier: z.string().nullable().optional(),

  idempotencyKey: z.string().nullable().optional(),

  cartSnapshot: z.any().optional(),

  inventoryReserved: z.boolean().default(false),
  inventoryConfirmed: z.boolean().default(false),

  userId: z.string().nullable().optional(),
});

import { z } from "zod";

export const paymentSchema = z.object({
  id: z.string().optional(),

  orderId: z.string(),
  provider: z.enum(["PAYSTACK", "MONNIFY", "BANK_TRANSFER"]),

  reference: z.string(),

  amount: z.number(),
  fee: z.number().nullable().optional(),

  currency: z.enum(["NGN", "USD", "GBP"]).default("NGN"),

  status: z.enum([
    "PENDING",
    "SUCCESS",
    "FAILED",
    "REFUNDED",
    "REVIEW",
    "CHARGEBACK",
    "EXPIRED",
    "PARTIAL",
  ]).default("PENDING"),

  channel: z.string().nullable().optional(),
  raw: z.any().optional(),

  paidAt: z.date().nullable().optional(),
  settledAt: z.date().nullable().optional(),
});

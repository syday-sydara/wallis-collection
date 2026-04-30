// === AUTO-GENERATED START ===
import { z } from "zod";

export const PaymentSchema = z.object({
  id: z.string(),
  orderId: z.string(),
  order: z.string(),
  provider: z.enum(["PAYSTACK", "MONNIFY", "BANK_TRANSFER"]),
  reference: z.string(),
  amount: z.number(),
  fee: z.number().optional(),
  currency: z.enum(["NGN", "USD", "GBP"]),
  status: z.enum([
    "PENDING",
    "SUCCESS",
    "FAILED",
    "REFUNDED",
    "REVIEW",
    "CHARGEBACK",
    "EXPIRED",
    "PARTIAL",
  ]),
  channel: z.string().optional(),
  raw: z.any().optional(),
  paidAt: z.date().optional(),
  settledAt: z.date().optional(),
  createdAt: z.date(),
});
// === AUTO-GENERATED END ===

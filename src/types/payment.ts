import { z } from "zod";

export const PaymentSchema = z.object({
  id: z.string().min(1),
  orderId: z.string().min(1),

  provider: z.enum(["BANK_TRANSFER", "CASH_ON_DELIVERY"]),

  amount: z.number().int().nonnegative(),
  currency: z.string().min(1),

  status: z.enum(["PENDING", "AWAITING_CONFIRMATION", "SUCCESS", "FAILED"]),

  reference: z.string().nullable().optional(),

  paidByName: z.string().nullable().optional(),
  paidAt: z.string().datetime().nullable().optional(),
  proofUrl: z.string().nullable().optional(),

  verifiedBy: z.string().nullable().optional(),
  verifiedAt: z.string().datetime().nullable().optional(),

  notes: z.string().nullable().optional(),

  createdAt: z.string().datetime(),
});

export type Payment = z.infer<typeof PaymentSchema>;
export type PaymentList = Payment[];

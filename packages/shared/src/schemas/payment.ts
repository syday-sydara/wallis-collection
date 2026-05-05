import { z } from "zod";

export const PaymentSchema = z.object({
  id: z.string().min(1),
  orderId: z.string().min(1),
  method: z.enum(["bank_transfer", "cash", "card", "manual"]),
  status: z.enum(["pending", "verified", "failed", "refunded"]),
  amount: z.number().int().nonnegative(),
  currency: z.string().min(1),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
});

export const PaymentListSchema = z.array(PaymentSchema);

export type Payment = z.infer<typeof PaymentSchema>;
export type PaymentList = z.infer<typeof PaymentListSchema>;
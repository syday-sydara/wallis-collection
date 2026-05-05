import { z } from "zod";

export const PaymentSchema = z.object({
  id: z.string().min(1),
  orderId: z.string().min(1),
  amount: z.number().int().nonnegative(),
  currency: z.string().min(1),
  status: z.string().min(1),
  provider: z.string().min(1),
  createdAt: z.string().datetime(),
});

export type Payment = z.infer<typeof PaymentSchema>;
export type PaymentList = Payment[];

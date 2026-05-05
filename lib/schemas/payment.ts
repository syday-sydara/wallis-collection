import { z } from "zod";

export const PaymentSchema = z.object({
  id: z.string(),
  orderId: z.string(),
  method: z.string(),
  status: z.string(),
  amount: z.number(),
  currency: z.string(),
});

export type Payment = z.infer<typeof PaymentSchema>;

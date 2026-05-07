import { z } from "zod";
import { OrderPaymentMethodEnum, PaymentStatusEnum } from "./order";

export const PaymentSchema = z.object({
  id: z.string(),
  orderId: z.string(),

  provider: OrderPaymentMethodEnum,

  amount: z.number().int().nonnegative(),
  currency: z.string(),

  status: PaymentStatusEnum,

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

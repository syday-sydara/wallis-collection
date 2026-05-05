import { z } from "zod";
import { PaymentProviderEnum, PaymentStatusEnum } from "./order";

export const PaymentSchema = z.object({
  id: z.string(),
  orderId: z.string(),
  provider: PaymentProviderEnum,
  amount: z.number().int(),
  currency: z.string(),
  status: PaymentStatusEnum,
  reference: z.string().nullable(),
  paidByName: z.string().nullable(),
  paidAt: z.string().datetime().nullable(),
  proofUrl: z.string().nullable(),
  verifiedBy: z.string().nullable(),
  verifiedAt: z.string().datetime().nullable(),
  notes: z.string().nullable(),
  createdAt: z.string().datetime(),
});

export type Payment = z.infer<typeof PaymentSchema>;

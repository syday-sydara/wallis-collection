import { z } from "zod";

export const OrderItemSchema = z.object({
  id: z.string(),
  variantId: z.string(),
  quantity: z.number(),
  unitPrice: z.number(),
  currency: z.string(),
});

export const OrderSchema = z.object({
  id: z.string(),
  status: z.string(),
  totalAmount: z.number(),
  currency: z.string(),
  phone: z.string().nullable(),
  phoneNormalized: z.string(),
  items: z.array(OrderItemSchema).optional(),
});

export type Order = z.infer<typeof OrderSchema>;
export type OrderItem = z.infer<typeof OrderItemSchema>;

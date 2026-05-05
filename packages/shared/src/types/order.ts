import { z } from "zod";

export const OrderItemSchema = z.object({
  id: z.string().min(1),
  variantId: z.string().min(1),
  quantity: z.number().int().positive(),
  unitPrice: z.number().int().nonnegative(),
  currency: z.string().min(1),
});

export const OrderSchema = z.object({
  id: z.string().min(1),
  status: z.string().min(1),
  totalAmount: z.number().int().nonnegative(),
  currency: z.string().min(1),
  phone: z.string().nullable(),
  phoneNormalized: z.string().min(1),
  items: z.array(OrderItemSchema).optional(),
});

export type Order = z.infer<typeof OrderSchema>;
export type OrderItem = z.infer<typeof OrderItemSchema>;
export type OrderList = Order[];

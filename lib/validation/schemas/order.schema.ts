import { z } from "zod";

export const orderItemSchema = z.object({
  productId: z.string(),
  quantity: z.number().int().positive(),
});

export const orderSchema = z.object({
  items: z.array(orderItemSchema).min(1),
  total: z.number().positive(),
  customerEmail: z.string().email(),
  customerPhone: z.string(),
  fullName: z.string().optional(),
});

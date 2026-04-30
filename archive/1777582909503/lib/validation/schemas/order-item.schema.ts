import { z } from "zod";

export const orderItemSchema = z.object({
  id: z.string().optional(),

  orderId: z.string(),
  variantId: z.string(),

  name: z.string(),
  image: z.string().nullable().optional(),
  attributes: z.any().optional(),

  quantity: z.number(),
  unitPrice: z.number(),
});

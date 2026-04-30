import { z } from "zod";

export const cartItemSchema = z.object({
  id: z.string().optional(),

  cartId: z.string(),
  productId: z.string(),
  variantId: z.string(),

  name: z.string(),
  image: z.string().nullable().optional(),
  unitPrice: z.number(),
  quantity: z.number(),

  attributes: z.any().optional(),
});

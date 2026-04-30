
// === AUTO-GENERATED START ===
import { z } from "zod";

export const CartItemSchema = z.object({
  id: z.string(),
  cartId: z.string(),
  cart: z.string(),
  productId: z.string(),
  variantId: z.string(),
  name: z.string(),
  image: z.string().optional(),
  unitPrice: z.number(),
  quantity: z.number(),
  attributes: z.any().optional(),
  createdAt: z.date(),
});
// === AUTO-GENERATED END ===

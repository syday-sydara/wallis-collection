// === AUTO-GENERATED START ===
import { z } from "zod";

export const OrderItemSchema = z.object({
  id: z.string(),
  orderId: z.string(),
  order: z.string(),
  variantId: z.string(),
  variant: z.string(),
  name: z.string(),
  image: z.string().optional(),
  attributes: z.any().optional(),
  quantity: z.number(),
  unitPrice: z.number(),
});
// === AUTO-GENERATED END ===

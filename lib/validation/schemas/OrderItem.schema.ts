// === AUTO-GENERATED START ===
import { z } from "zod";

export const OrderItemSchema = z.object({
  id: z.string(),
  orderId: z.string(),
  order: OrderSchema,
  variantId: z.string(),
  variant: ProductVariantSchema,
  name: z.string(),
  image: z.string().optional(),
  attributes: z.any().optional(),
  quantity: z.number(),
  unitPrice: z.number(),
});
// === AUTO-GENERATED END ===

// === AUTO-GENERATED START ===
import { z } from "zod";

export const ProductVariantSchema = z.object({
  id: z.string(),
  productId: z.string(),
  product: ProductSchema,
  name: z.string(),
  sku: z.string(),
  price: z.number(),
  stock: z.number(),
  reservedStock: z.number(),
  compareAtPrice: z.number().optional(),
  costPrice: z.number().optional(),
  attributes: z.any().optional(),
  orderItems: z.array(OrderItemSchema),
  stockLogs: z.array(StockLogSchema),
});
// === AUTO-GENERATED END ===

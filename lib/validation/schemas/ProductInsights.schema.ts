
// === AUTO-GENERATED START ===
import { z } from "zod";

export const ProductInsightsSchema = z.object({
  productId: z.string(),
  product: z.string(),
  viewCount: z.number(),
  addToCartCount: z.number(),
  whatsappClickCount: z.number(),
  checkoutClickCount: z.number(),
  purchaseCount: z.number(),
  addToCartRate: z.number(),
  checkoutClickRate: z.number(),
  whatsappClickRate: z.number(),
  conversionRate: z.number(),
  variantPopularity: z.any().optional(),
  abandonmentCount: z.number(),
  fraudFlagCount: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
// === AUTO-GENERATED END ===


// === AUTO-GENERATED START ===
import { z } from "zod";

export const ProductImageSchema = z.object({
  id: z.string(),
  url: z.string(),
  publicId: z.string(),
  width: z.number().optional(),
  height: z.number().optional(),
  format: z.string().optional(),
  bytes: z.number().optional(),
  alt: z.string().optional(),
  sortOrder: z.number(),
  isPrimary: z.boolean(),
  productId: z.string(),
  product: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
// === AUTO-GENERATED END ===

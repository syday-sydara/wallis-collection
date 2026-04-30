
// === AUTO-GENERATED START ===
import { z } from "zod";

export const ProductSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  description: z.string().optional(),
  basePrice: z.number().optional(),
  isArchived: z.boolean(),
  isPublished: z.boolean(),
  publishedAt: z.date().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
  images: z.array(z.string()),
  variants: z.array(z.string()),
  categories: z.array(z.string()),
});
// === AUTO-GENERATED END ===

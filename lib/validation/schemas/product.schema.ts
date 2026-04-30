import { z } from "zod";

export const productSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2),
  description: z.string().max(2000).optional(),
  price: z.number().positive(),
  currency: z.string().length(3).default("NGN"),
  active: z.boolean().default(true),
  imageUrl: z.string().url().optional(),
  stock: z.number().int().nonnegative().default(0),
});

import { z } from "zod";

export const productVariantSchema = z.object({
  id: z.string().optional(),
  productId: z.string(),

  name: z.string(),
  sku: z.string(),
  price: z.number(),

  stock: z.number().default(0),
  reservedStock: z.number().default(0),

  compareAtPrice: z.number().nullable().optional(),
  costPrice: z.number().nullable().optional(),

  attributes: z.any().optional(),
});

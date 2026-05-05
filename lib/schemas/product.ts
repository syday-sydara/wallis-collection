import { z } from "zod";

export const VariantSchema = z.object({
  id: z.string(),
  sku: z.string(),
  name: z.string(),
  price: z.number(),
  currency: z.string(),
  stockQty: z.number(),
});

export const ProductSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  description: z.string().nullable(),
  variants: z.array(VariantSchema),
});

export type Product = z.infer<typeof ProductSchema>;
export type Variant = z.infer<typeof VariantSchema>;

import { z } from "zod";

export const VariantSchema = z.object({
  id: z.string().min(1),
  sku: z.string().min(1),
  name: z.string().min(1),
  price: z.number().int().nonnegative(),
  currency: z.string().min(1),
  stockQty: z.number().int().nonnegative(),
});

export const ProductSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().nullable(),
  variants: z.array(VariantSchema),
});

export const ProductListSchema = z.array(ProductSchema);

export type Product = z.infer<typeof ProductSchema>;
export type Variant = z.infer<typeof VariantSchema>;

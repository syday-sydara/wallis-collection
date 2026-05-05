import { z } from "zod";

export const ProductVariantSchema = z.object({
  id: z.string(),
  productId: z.string(),
  sku: z.string(),
  name: z.string(),
  price: z.number().int(),
  currency: z.string(),
  stockQty: z.number().int(),
  isActive: z.boolean(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const ProductSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  description: z.string().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  variants: z.array(ProductVariantSchema).optional(),
});

export type Product = z.infer<typeof ProductSchema>;
export type ProductVariant = z.infer<typeof ProductVariantSchema>;

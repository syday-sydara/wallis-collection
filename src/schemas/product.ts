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

  // Keep optional ONLY if your API sometimes omits it
  images: z.array(z.string().url()).optional(),

  // Variants should always be present
  variants: z.array(ProductVariantSchema),
});

export type Product = z.infer<typeof ProductSchema>;
export type ProductVariant = z.infer<typeof ProductVariantSchema>;
export type ProductList = Product[];

import { z } from "zod";

// ---------------------------------------------
// PRODUCT VARIANT
// ---------------------------------------------
export const ProductVariantSchema = z.object({
  id: z.string().min(1),
  productId: z.string().min(1),

  name: z.string().min(1),
  sku: z.string().min(1),

  price: z.number().int().nonnegative(),
  currency: z.string().min(1),

  stockQty: z.number().int().nonnegative(),

  isActive: z.boolean(),

  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

// ---------------------------------------------
// PRODUCT
// ---------------------------------------------
export const ProductSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  slug: z.string().min(1),

  description: z.string().nullable(),

  // If your API returns images, keep this.
  // If not, remove it.
  images: z.array(z.string().url()).optional(),

  variants: z.array(ProductVariantSchema),

  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type Product = z.infer<typeof ProductSchema>;
export type ProductVariant = z.infer<typeof ProductVariantSchema>;
export type ProductList = Product[];

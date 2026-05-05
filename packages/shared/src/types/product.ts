import { z } from "zod";

export const ProductVariantSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  price: z.number().int().nonnegative(),
  currency: z.string().min(1),
  stock: z.number().int().nonnegative(),
});

export const ProductSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string().nullable(),
  images: z.array(z.string().url()).optional(),
  variants: z.array(ProductVariantSchema),
});

export type Product = z.infer<typeof ProductSchema>;
export type ProductVariant = z.infer<typeof ProductVariantSchema>;
export type ProductList = Product[];

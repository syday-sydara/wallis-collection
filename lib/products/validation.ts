import { z } from "zod";

export const updateProductSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required"),
  basePrice: z.coerce.number().min(0),
  stock: z.coerce.number().min(0),
  description: z.string().optional().nullable(),
});

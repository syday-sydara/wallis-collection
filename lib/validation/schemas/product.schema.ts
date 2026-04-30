import { z } from "zod";

export const productImageSchema = z.object({
  id: z.string().optional(),

  url: z.string().url(),
  publicId: z.string(),
  width: z.number().nullable().optional(),
  height: z.number().nullable().optional(),
  format: z.string().nullable().optional(),
  bytes: z.number().nullable().optional(),

  alt: z.string().nullable().optional(),

  sortOrder: z.number().default(0),
  isPrimary: z.boolean().default(false),

  productId: z.string(),
});

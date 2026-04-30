import { z } from "zod";

export const addressSchema = z.object({
  id: z.string().optional(),

  userId: z.string().nullable().optional(),

  fullName: z.string(),
  phone: z.string(),

  line1: z.string(),
  line2: z.string().nullable().optional(),

  city: z.string(),
  state: z.string(),
  lga: z.string().nullable().optional(),
  postalCode: z.string().nullable().optional(),

  country: z.string().default("Nigeria"),
});

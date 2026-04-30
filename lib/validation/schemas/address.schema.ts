// === AUTO-GENERATED START ===
import { z } from "zod";

export const AddressSchema = z.object({
  id: z.string(),
  userId: z.string().optional(),
  user: z.string().optional(),
  fullName: z.string(),
  phone: z.string(),
  line1: z.string(),
  line2: z.string().optional(),
  city: z.string(),
  state: z.string(),
  lga: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string(),
  createdAt: z.date(),
});
// === AUTO-GENERATED END ===

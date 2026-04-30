import { z } from "zod";
import { NIGERIAN_STATES } from "@/lib/constants/nigerian-states";

export const addressSchema = z.object({
  line1: z.string().min(3),
  line2: z.string().optional(),
  city: z.string().min(2),
  state: z.enum(NIGERIAN_STATES),
  country: z.string().default("Nigeria"),
  postalCode: z.string().optional(),
});

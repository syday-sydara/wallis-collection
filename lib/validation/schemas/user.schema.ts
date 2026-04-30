import { z } from "zod";

export const userSchema = z.object({
  id: z.string().optional(),
  email: z.string().email(),
  fullName: z.string().min(2),
  phone: z.string().min(5).optional(),
  role: z.enum(["user", "admin"]).default("user"),
  active: z.boolean().default(true),
});

import { z } from "zod";

export const userSchema = z.object({
  id: z.string().optional(),
  email: z.string().email(),
  name: z.string().nullable().optional(),

  role: z.enum(["USER", "ADMIN"]).default("USER"),
  status: z.enum(["ACTIVE", "DISABLED", "BANNED"]).default("ACTIVE"),

  passwordHash: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  emailVerifiedAt: z.date().nullable().optional(),

  risk_score: z.number().default(0),
  permissions: z.any().optional(),
  deniedPermissions: z.any().optional(),

  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

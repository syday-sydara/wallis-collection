import { z } from "zod";

export const otpSchema = z.object({
  id: z.string().optional(),

  phone: z.string(),
  code: z.string(),

  type: z.enum(["LOGIN", "VERIFY_PHONE", "RESET_PASSWORD", "ORDER_CONFIRMATION"])
    .default("LOGIN"),

  expiresAt: z.date(),
  used: z.boolean().default(false),
  attempts: z.number().default(0),
});

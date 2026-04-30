// === AUTO-GENERATED START ===
import { z } from "zod";

export const OTPSchema = z.object({
  id: z.string(),
  phone: z.string(),
  code: z.string(),
  type: z.enum([
    "LOGIN",
    "VERIFY_PHONE",
    "RESET_PASSWORD",
    "ORDER_CONFIRMATION",
  ]),
  expiresAt: z.date(),
  used: z.boolean(),
  attempts: z.number(),
  createdAt: z.date(),
});
// === AUTO-GENERATED END ===

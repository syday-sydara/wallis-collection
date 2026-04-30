import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6),
});

export const registerSchema = z.object({
  email: z.string().email(),
  fullName: z.string().min(2),
  password: z.string().min(8),
});

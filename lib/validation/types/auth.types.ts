import { z } from "zod";
import {
  loginSchema,
  registerSchema,
  refreshTokenSchema,
} from "../schemas/auth.schema";

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;

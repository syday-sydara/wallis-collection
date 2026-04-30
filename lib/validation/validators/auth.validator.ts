import { loginSchema, registerSchema, refreshTokenSchema } from "../schemas/auth.schema";
import { safeParseOrThrow } from "../zod-helpers";

export function validateLogin(input: unknown) {
  return safeParseOrThrow(loginSchema, input);
}

export function validateRegister(input: unknown) {
  return safeParseOrThrow(registerSchema, input);
}

export function validateRefreshToken(input: unknown) {
  return safeParseOrThrow(refreshTokenSchema, input);
}

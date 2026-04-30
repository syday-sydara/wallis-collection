// === AUTO-GENERATED START ===
import { OTPSchema } from "../schemas/OTP.schema";
import { safeParseOrThrow } from "../zod-helpers";

export function validateOTP(input: unknown) {
  return safeParseOrThrow(OTPSchema, input);
}
// === AUTO-GENERATED END ===

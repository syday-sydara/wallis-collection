// === AUTO-GENERATED START ===
import { UserSchema } from "../schemas/User.schema";
import { safeParseOrThrow } from "../zod-helpers";

export function validateUser(input: unknown) {
  return safeParseOrThrow(UserSchema, input);
}
// === AUTO-GENERATED END ===

import { userSchema } from "../schemas/user.schema";
import { safeParseOrThrow } from "./zod-helpers";

export function validateUser(input: unknown) {
  return safeParseOrThrow(userSchema, input);
}

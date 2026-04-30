// === AUTO-GENERATED START ===
import { CategorySchema } from "../schemas/Category.schema";
import { safeParseOrThrow } from "../zod-helpers";

export function validateCategory(input: unknown) {
  return safeParseOrThrow(CategorySchema, input);
}
// === AUTO-GENERATED END ===

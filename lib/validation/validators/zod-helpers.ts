import { ZodError, ZodSchema } from "zod";
import { ValidationError } from "../errors/ValidationError";
import { formatZodError } from "../errors/formatZodError";

export function safeParseOrThrow<T>(schema: ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new ValidationError(
      "Validation failed",
      formatZodError(result.error),
    );
  }
  return result.data;
}

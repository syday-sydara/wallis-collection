import { uploadImageSchema } from "../schemas/upload.schema";
import { safeParseOrThrow } from "./zod-helpers";

export function validateUploadConfig(input: unknown) {
  return safeParseOrThrow(uploadImageSchema, input);
}

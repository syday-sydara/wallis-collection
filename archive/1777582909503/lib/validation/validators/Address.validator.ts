// === AUTO-GENERATED START ===
import { AddressSchema } from "../schemas/Address.schema";
import { safeParseOrThrow } from "../zod-helpers";

export function validateAddress(input: unknown) {
  return safeParseOrThrow(AddressSchema, input);
}
// === AUTO-GENERATED END ===

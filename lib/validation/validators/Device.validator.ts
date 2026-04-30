
// === AUTO-GENERATED START ===
import { DeviceSchema } from "../schemas/Device.schema";
import { safeParseOrThrow } from "../zod-helpers";

export function validateDevice(input) {
  return safeParseOrThrow(DeviceSchema, input);
}
// === AUTO-GENERATED END ===


// === AUTO-GENERATED START ===
import { DeviceEventSchema } from "../schemas/DeviceEvent.schema";
import { safeParseOrThrow } from "../zod-helpers";

export function validateDeviceEvent(input) {
  return safeParseOrThrow(DeviceEventSchema, input);
}
// === AUTO-GENERATED END ===

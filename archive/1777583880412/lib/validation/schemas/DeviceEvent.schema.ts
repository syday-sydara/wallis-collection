// === AUTO-GENERATED START ===
import { z } from "zod";

export const DeviceEventSchema = z.object({
  id: z.string(),
  deviceId: z.string().optional(),
  userId: z.string().optional(),
  ip: z.string().optional(),
  userAgent: z.string().optional(),
  metadata: z.any().optional(),
  createdAt: z.date(),
});
// === AUTO-GENERATED END ===

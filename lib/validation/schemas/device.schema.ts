// === AUTO-GENERATED START ===
import { z } from "zod";

export const DeviceSchema = z.object({
  id: z.string(),
  userId: z.string(),
  user: z.string(),
  deviceFingerprint: z.string(),
  userAgent: z.string().optional(),
  lastIpAddress: z.string().optional(),
  trusted: z.boolean(),
  createdAt: z.date(),
  lastSeen: z.date(),
});
// === AUTO-GENERATED END ===

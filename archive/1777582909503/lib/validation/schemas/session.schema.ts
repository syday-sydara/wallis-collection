// === AUTO-GENERATED START ===
import { z } from "zod";

export const SessionSchema = z.object({
  id: z.string(),
  userId: z.string(),
  user: UserSchema,
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
  deviceId: z.string().optional(),
  createdAt: z.date(),
  lastActive: z.date(),
  revokedAt: z.date().optional(),
  riskScore: z.number(),
});
// === AUTO-GENERATED END ===

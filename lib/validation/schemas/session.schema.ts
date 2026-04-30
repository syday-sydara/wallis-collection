import { z } from "zod";

export const sessionSchema = z.object({
  id: z.string().optional(),

  userId: z.string(),

  ipAddress: z.string().nullable().optional(),
  userAgent: z.string().nullable().optional(),
  deviceId: z.string().nullable().optional(),

  riskScore: z.number().default(0),
});

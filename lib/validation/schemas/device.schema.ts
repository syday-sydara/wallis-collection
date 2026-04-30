import { z } from "zod";

export const deviceSchema = z.object({
  id: z.string().optional(),

  userId: z.string(),

  deviceFingerprint: z.string(),
  userAgent: z.string().nullable().optional(),
  lastIpAddress: z.string().nullable().optional(),

  trusted: z.boolean().default(false),
});

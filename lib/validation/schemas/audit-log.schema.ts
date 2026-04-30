import { z } from "zod";

export const auditLogSchema = z.object({
  id: z.string().optional(),

  action: z.string(),
  actorType: z.string(),
  actorId: z.string().nullable().optional(),
  resource: z.string().nullable().optional(),
  resourceId: z.string().nullable().optional(),
  metadata: z.any().optional(),
});

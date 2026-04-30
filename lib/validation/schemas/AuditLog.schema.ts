
// === AUTO-GENERATED START ===
import { z } from "zod";

export const AuditLogSchema = z.object({
  id: z.string(),
  action: z.string(),
  actorType: z.string(),
  actorId: z.string().optional(),
  resource: z.string().optional(),
  resourceId: z.string().optional(),
  metadata: z.any().optional(),
  createdAt: z.date(),
  userId: z.string().optional(),
  user: z.string().optional(),
});
// === AUTO-GENERATED END ===

import { z } from "zod";

export const ActorTypeEnum = z.enum(["USER", "ADMIN", "SYSTEM"]);

export const AuditLogSchema = z.object({
  id: z.string(),
  userId: z.string().nullable(),
  actorType: ActorTypeEnum,
  action: z.string(),
  entityType: z.string(),
  entityId: z.string(),
  metadata: z.any(),
  ipAddress: z.string().nullable(),
  userAgent: z.string().nullable(),
  createdAt: z.string().datetime(),
});

export type AuditLog = z.infer<typeof AuditLogSchema>;

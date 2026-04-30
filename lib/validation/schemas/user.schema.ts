
// === AUTO-GENERATED START ===
import { z } from "zod";

export const UserSchema = z.object({
  id: z.string(),
  email: z.string(),
  name: z.string().optional(),
  role: z.enum(["USER", "ADMIN"]),
  status: z.enum(["ACTIVE", "DISABLED", "BANNED"]),
  passwordHash: z.string().optional(),
  phone: z.string().optional(),
  emailVerifiedAt: z.date().optional(),
  risk_score: z.number(),
  permissions: z.any().optional(),
  deniedPermissions: z.any().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
  orders: z.array(z.string()),
  addresses: z.array(z.string()),
  sessions: z.array(z.string()),
  devices: z.array(z.string()),
  cart: z.string().optional(),
  auditLogs: z.array(z.string()),
});
// === AUTO-GENERATED END ===

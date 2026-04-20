// lib/auth/require-admin.ts
import { requirePermission } from "./require-permission";

export function requireAdmin(req?: {
  ip?: string | null;
  userAgent?: string | null;
  requestId?: string | null;
  source?: string | null;
}) {
  return requirePermission("VIEW_ADMIN", req);
}

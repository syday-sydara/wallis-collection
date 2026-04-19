// lib/auth/require-admin.ts
import { requirePermission } from "./require-permission";

export function requireAdmin(req: Request) {
  return requirePermission(req, "VIEW_ADMIN");
}

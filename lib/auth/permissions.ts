import type { SessionUser } from "./session";

export type Permission =
  | "VIEW_SECURITY_CENTER"
  | "VIEW_RISK_SCORE"
  | "VIEW_SESSIONS"
  | "VIEW_DEVICES";

const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  ADMIN: [
    "VIEW_SECURITY_CENTER",
    "VIEW_RISK_SCORE",
    "VIEW_SESSIONS",
    "VIEW_DEVICES"
  ],
  STAFF: ["VIEW_SECURITY_CENTER", "VIEW_SESSIONS"],
  USER: []
};

export function hasPermission(user: SessionUser | null, perm: Permission) {
  if (!user) return false;
  return ROLE_PERMISSIONS[user.role]?.includes(perm) ?? false;
}

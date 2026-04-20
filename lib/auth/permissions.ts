// lib/auth/permissions.ts

export type Role =
  | "SUPER_ADMIN"
  | "ADMIN"
  | "STAFF"
  | "SECURITY_ADMIN"
  | "USER";

export const PERMISSIONS = {
  VIEW_SECURITY_CENTER: "VIEW_SECURITY_CENTER",
  VIEW_RISK_SCORE: "VIEW_RISK_SCORE",
  VIEW_SESSIONS: "VIEW_SESSIONS",
  VIEW_DEVICES: "VIEW_DEVICES",
  VIEW_ADMIN: "VIEW_ADMIN",
  VIEW_AUDIT_LOGS: "VIEW_AUDIT_LOGS",
  MANAGE_USERS: "MANAGE_USERS",
  MANAGE_ROLES: "MANAGE_ROLES",
  MANAGE_SECURITY: "MANAGE_SECURITY",
} as const;

export type Permission = keyof typeof PERMISSIONS;

export interface SessionUser {
  id: string;
  role: string | string[];
  permissions?: string[];
  deniedPermissions?: string[];
}

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  SUPER_ADMIN: [...Object.keys(PERMISSIONS) as Permission[]],
  ADMIN: [
    "VIEW_ADMIN",
    "VIEW_SECURITY_CENTER",
    "VIEW_AUDIT_LOGS",
    "VIEW_RISK_SCORE",
    "VIEW_SESSIONS",
    "VIEW_DEVICES",
    "MANAGE_USERS",
    "MANAGE_ROLES",
    "MANAGE_SECURITY",
  ],
  STAFF: ["VIEW_ADMIN", "VIEW_SECURITY_CENTER", "VIEW_SESSIONS"],
  SECURITY_ADMIN: [
    "VIEW_ADMIN",
    "VIEW_SECURITY_CENTER",
    "VIEW_AUDIT_LOGS",
    "MANAGE_SECURITY",
  ],
  USER: [],
};

/* -------------------------------------------------- */
/* Helpers                                             */
/* -------------------------------------------------- */

export function isRole(value: string): value is Role {
  return Object.hasOwn(ROLE_PERMISSIONS, value);
}

export function normalizeRoles(role: string | string[]): Role[] {
  const roles = Array.isArray(role) ? role : [role];
  return roles
    .map((r) => r.toUpperCase())
    .filter(isRole);
}

export function normalizePermissions(
  perms?: string[]
): Permission[] {
  if (!perms) return [];
  return perms.filter((p): p is Permission => p in PERMISSIONS);
}

/* -------------------------------------------------- */
/* Core permission logic                               */
/* -------------------------------------------------- */

export function hasPermission(
  user: SessionUser | null,
  perm: Permission
): boolean {
  if (!user) return false;

  const roles = normalizeRoles(user.role);

  // SUPER_ADMIN bypass
  if (roles.includes("SUPER_ADMIN")) return true;

  const denied = normalizePermissions(user.deniedPermissions);
  if (denied.includes(perm)) return false;

  const direct = normalizePermissions(user.permissions);
  if (direct.includes(perm)) return true;

  return roles.some((role) =>
    ROLE_PERMISSIONS[role]?.includes(perm)
  );
}

/* -------------------------------------------------- */
/* Multi-permission helpers                            */
/* -------------------------------------------------- */

export function hasAllPermissions(
  user: SessionUser | null,
  perms: Permission[]
): boolean {
  return perms.every((p) => hasPermission(user, p));
}

export function hasAnyPermission(
  user: SessionUser | null,
  perms: Permission[]
): boolean {
  return perms.some((p) => hasPermission(user, p));
}

/* -------------------------------------------------- */
/* Effective permissions                               */
/* -------------------------------------------------- */

export function getUserPermissions(user: SessionUser | null): Permission[] {
  if (!user) return [];

  const roles = normalizeRoles(user.role);

  if (roles.includes("SUPER_ADMIN")) {
    return [...Object.keys(PERMISSIONS) as Permission[]];
  }

  const rolePerms = roles.flatMap((r) => ROLE_PERMISSIONS[r] ?? []);
  const directPerms = normalizePermissions(user.permissions);
  const denied = normalizePermissions(user.deniedPermissions);

  const merged = new Set<Permission>([...rolePerms, ...directPerms]);
  denied.forEach((d) => merged.delete(d));

  return [...merged];
}

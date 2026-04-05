// lib/auth/permissions.ts
import type { SessionUser } from "./session";

/* -------------------------------------------------- */
/* Roles */
/* -------------------------------------------------- */
export type Role =
  | "SUPER_ADMIN"
  | "ADMIN"
  | "STAFF"
  | "SECURITY_ADMIN"
  | "USER";

/* -------------------------------------------------- */
/* Permission constants (prevents typos) */
/* -------------------------------------------------- */
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

/* -------------------------------------------------- */
/* Role → Permission mapping */
/* -------------------------------------------------- */
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
  STAFF: [
    "VIEW_ADMIN",
    "VIEW_SECURITY_CENTER",
    "VIEW_SESSIONS",
  ],
  SECURITY_ADMIN: [
    "VIEW_ADMIN",
    "VIEW_SECURITY_CENTER",
    "VIEW_AUDIT_LOGS",
    "MANAGE_SECURITY",
  ],
  USER: [],
};

/* -------------------------------------------------- */
/* Permission checker */
/* -------------------------------------------------- */
export function hasPermission(
  user: SessionUser | null,
  perm: Permission
): boolean {
  if (!user) return false;

  // SUPER_ADMIN bypass
  if (user.role === "SUPER_ADMIN" || (Array.isArray(user.role) && user.role.includes("SUPER_ADMIN"))) {
    return true;
  }

  // Deny list first (highest priority)
  if (user.deniedPermissions?.includes(perm)) return false;

  // Direct user-level permissions
  if (user.permissions?.includes(perm)) return true;

  // Multi-role support
  const roles = Array.isArray(user.role) ? user.role : [user.role];

  return roles.some((role) =>
    ROLE_PERMISSIONS[role as Role]?.includes(perm)
  );
}

/* -------------------------------------------------- */
/* Check multiple permissions */
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
/* Get all effective permissions for a user */
/* -------------------------------------------------- */
export function getUserPermissions(user: SessionUser | null): Permission[] {
  if (!user) return [];

  if (user.role === "SUPER_ADMIN" || (Array.isArray(user.role) && user.role.includes("SUPER_ADMIN"))) {
    return [...Object.keys(PERMISSIONS)] as Permission[];
  }

  const roles = Array.isArray(user.role) ? user.role : [user.role];

  const rolePerms = roles.flatMap(r => ROLE_PERMISSIONS[r as Role] ?? []);
  const directPerms = user.permissions ?? [];
  const denied = user.deniedPermissions ?? [];

  // Merge, remove denied, dedupe
  const merged = new Set<Permission>([...rolePerms, ...directPerms]);
  denied.forEach(d => merged.delete(d));

  return [...merged];
}
// lib/auth/session.ts

import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { createHmac, timingSafeEqual } from "crypto";
import {
  normalizeRoles,
  normalizePermissions,
  type Role,
  type Permission,
} from "./permissions";

export type SessionUser = {
  id: string;
  email: string;
  name: string | null;
  role: Role[]; // normalized
  risk_score: number;
  permissions: Permission[];
  deniedPermissions: Permission[];
};

const SECRET = process.env.SESSION_SECRET!;
const COOKIE_NAME = "wallis_session";

/* -------------------------------------------------- */
/* Base64 helpers                                      */
/* -------------------------------------------------- */

function encode(data: object) {
  return Buffer.from(JSON.stringify(data)).toString("base64url");
}

function decode<T>(b64: string): T | null {
  try {
    return JSON.parse(Buffer.from(b64, "base64url").toString("utf8"));
  } catch {
    return null;
  }
}

/* -------------------------------------------------- */
/* HMAC signing + timing-safe compare                  */
/* -------------------------------------------------- */

function sign(payload: string) {
  return createHmac("sha256", SECRET).update(payload).digest("hex");
}

function safeCompare(a: string, b: string) {
  const bufA = Buffer.from(a, "utf8");
  const bufB = Buffer.from(b, "utf8");
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

/* -------------------------------------------------- */
/* Cookie access                                       */
/* -------------------------------------------------- */

async function getSessionToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(COOKIE_NAME)?.value ?? null;
}

/* -------------------------------------------------- */
/* Unified token parser (NO logging here)              */
/* -------------------------------------------------- */

export async function parseSessionToken(
  token: string | null
): Promise<SessionUser | null> {
  if (!token || token.length > 4096) return null;

  const [payloadB64, signature] = token.split(".");
  if (!payloadB64 || !signature) return null;

  const expected = sign(payloadB64);
  if (!safeCompare(expected, signature)) return null;

  const payload = decode<SessionUser & { exp?: number }>(payloadB64);
  if (!payload) return null;

  if (payload.exp && Date.now() / 1000 > payload.exp) return null;

  // Normalize roles + permissions
  const roles = normalizeRoles(payload.role);
  const permissions = normalizePermissions(payload.permissions);
  const denied = normalizePermissions(payload.deniedPermissions);

  return {
    id: payload.id,
    email: payload.email,
    name: payload.name ?? null,
    role: roles,
    risk_score: payload.risk_score ?? 0,
    permissions,
    deniedPermissions: denied,
  };
}

/* -------------------------------------------------- */
/* Fast session (token only)                           */
/* -------------------------------------------------- */

export async function getSessionFast(): Promise<SessionUser | null> {
  const token = await getSessionToken();
  return parseSessionToken(token);
}

/* -------------------------------------------------- */
/* Hybrid session with optional DB refresh             */
/* -------------------------------------------------- */

export async function getSessionUser(
  options?: { fresh?: boolean }
): Promise<SessionUser | null> {
  const token = await getSessionToken();
  const session = await parseSessionToken(token);
  if (!session) return null;

  // Fast path
  if (!options?.fresh) {
    if (session.permissions.length > 0 && session.risk_score !== undefined) {
      return session;
    }
  }

  // DB refresh
  const dbUser = await prisma.user.findUnique({
    where: { id: session.id },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      risk_score: true,
      permissions: true,
      deniedPermissions: true,
    },
  });

  if (!dbUser) return null;

  return {
    id: dbUser.id,
    email: dbUser.email,
    name: dbUser.name,
    role: normalizeRoles(dbUser.role),
    risk_score: dbUser.risk_score ?? 0,
    permissions: normalizePermissions(dbUser.permissions),
    deniedPermissions: normalizePermissions(dbUser.deniedPermissions),
  };
}

/* -------------------------------------------------- */
/* Require user for critical operations                */
/* -------------------------------------------------- */

export async function requireSessionUser(): Promise<SessionUser> {
  const user = await getSessionUser({ fresh: true });
  if (!user) throw new Error("Unauthorized");
  return user;
}

/* -------------------------------------------------- */
/* Create session token                                */
/* -------------------------------------------------- */

export function createSessionToken(user: {
  id: string;
  role: string | string[];
  email?: string;
  risk_score: number;
  permissions?: string[];
  deniedPermissions?: string[];
}) {
  const payload = {
    id: user.id,
    role: user.role,
    email: user.email,
    risk_score: user.risk_score,
    permissions: user.permissions ?? [],
    deniedPermissions: user.deniedPermissions ?? [],
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7, // 7 days
  };

  const signed = encode(payload);
  const signature = sign(signed);
  return `${signed}.${signature}`;
}

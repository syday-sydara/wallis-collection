// lib/auth/session.ts
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { createHmac, timingSafeEqual } from "crypto";

export type SessionUser = {
  id: string;
  email: string;
  name: string | null;
  role: string | string[];
  risk_score: number;
  permissions?: string[];
  deniedPermissions?: string[];
};

const SECRET = process.env.SESSION_SECRET!;
const COOKIE_NAME = "wallis_session";

/* -------------------------------------------------- */
/* Helper: Base64 encode / decode */
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
/* HMAC signing + timing-safe compare */
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
/* Cookie helpers */
async function getSessionToken(): Promise<string | null> {
  const cookiesList = await cookies();
  return cookiesList.get(COOKIE_NAME)?.value ?? null;
}

/* -------------------------------------------------- */
/* Decode + verify token */
async function resolveToken(token: string | null): Promise<SessionUser | null> {
  if (!token) return null;

  const [payloadB64, signature] = token.split(".");
  if (!payloadB64 || !signature) return null;

  const expected = sign(payloadB64);
  if (!safeCompare(expected, signature)) return null;

  const payload = decode<SessionUser & { exp?: number }>(payloadB64);
  if (!payload) return null;

  if (payload.exp && Date.now() / 1000 > payload.exp) return null;

  return payload;
}

/* -------------------------------------------------- */
/* Edge-safe fast session (no DB hit) */
export async function getSessionFast(): Promise<SessionUser | null> {
  const token = await getSessionToken();
  return resolveToken(token);
}

/* -------------------------------------------------- */
/* Hybrid session with optional DB fetch */
type GetSessionOptions = {
  fresh?: boolean; // force DB refresh
};

export async function getSessionUser(
  options?: GetSessionOptions
): Promise<SessionUser | null> {
  const token = await getSessionToken();
  const session = await resolveToken(token);
  if (!session?.id) return null;

  // Fast path (use token only)
  if (!options?.fresh) {
    if (session.permissions === undefined || session.risk_score === undefined) {
      options = { fresh: true };
    } else {
      return session;
    }
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: session.id },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      riskScore: true,
      permissions: true,
      deniedPermissions: true,
    },
  });

  if (!dbUser) return null;

  const dbPermissions = Array.isArray(dbUser.permissions)
    ? dbUser.permissions.filter((item): item is string => typeof item === "string")
    : undefined;
  const dbDeniedPermissions = Array.isArray(dbUser.deniedPermissions)
    ? dbUser.deniedPermissions.filter((item): item is string => typeof item === "string")
    : undefined;

  return {
    id: dbUser.id,
    email: dbUser.email,
    name: dbUser.name,
    role: dbUser.role,
    risk_score: dbUser.riskScore ?? 0,
    permissions: dbPermissions,
    deniedPermissions: dbDeniedPermissions,
  };
}

/* -------------------------------------------------- */
/* Require user for critical operations */
export async function requireSessionUser(): Promise<SessionUser> {
  const user = await getSessionUser({ fresh: true });
  if (!user) throw new Error("Unauthorized");
  return user;
}

/* -------------------------------------------------- */
/* Create session token for login or refresh */
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
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7,
  };

  const signed = encode(payload);
  const signature = sign(signed);
  return `${signed}.${signature}`;
}

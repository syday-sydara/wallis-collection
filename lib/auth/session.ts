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
function getSessionToken(): string | null {
  return cookies().get(COOKIE_NAME)?.value ?? null;
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
  const token = getSessionToken();
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
  const token = getSessionToken();
  const session = await resolveToken(token);
  if (!session?.id) return null;

  // Fast path (use token only)
  if (!options?.fresh) {
    // Auto-escalation: check if token lacks critical fields
    if (session.permissions === undefined || session.risk_score === undefined) {
      options = { fresh: true }; // force DB
    } else {
      return session;
    }
  }

  // Slow path (authoritative)
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
  return dbUser;
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
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7, // 7 days
  };

  const payloadB64 = encode(payload);
  const signature = sign(payloadB64);
  return `${payloadB64}.${signature}`;
}

/* -------------------------------------------------- */
/* Optional: refresh token if risk/permissions changed */
export async function refreshSessionTokenIfNeeded(userId: string) {
  const dbUser = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      role: true,
      email: true,
      risk_score: true,
      permissions: true,
      deniedPermissions: true,
    },
  });

  if (!dbUser) return null;

  const newToken = createSessionToken({
    id: dbUser.id,
    role: dbUser.role,
    email: dbUser.email ?? undefined,
    risk_score: dbUser.risk_score ?? 0,
    permissions: dbUser.permissions ?? [],
    deniedPermissions: dbUser.deniedPermissions ?? [],
  });

  return newToken;
}
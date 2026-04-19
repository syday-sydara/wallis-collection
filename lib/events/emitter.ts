// lib/events/emitter.ts (recommended filename)

import { prisma } from "@/lib/db";
import { headers } from "next/headers";
import { encrypt } from "@/lib/security/crypto";
import {
  SecurityEventType,
  FraudSignal,
  AlertEventType,
} from "@/lib/events/types";

/* -------------------------------------------------- */
/* Normalizers                                         */
/* -------------------------------------------------- */

const VALID_SEVERITIES = ["low", "medium", "high"] as const;
type Severity = (typeof VALID_SEVERITIES)[number];

function normalizeSeverity(sev?: string | null): Severity {
  if (!sev) return "low";
  const s = sev.toLowerCase().trim();
  return VALID_SEVERITIES.includes(s as Severity) ? (s as Severity) : "low";
}

function normalizeCategory(category?: string | null) {
  if (!category) return null;
  const trimmed = category.trim().toLowerCase();
  return trimmed.length > 0 ? trimmed : null;
}

function normalizeIp(ip?: string | null): string | null {
  if (!ip) return null;

  // IPv6
  if (ip.includes(":") && !ip.includes(".")) return ip;

  // IPv4 with port
  return ip.split(":")[0];
}

async function extractRequestContext(ip?: string | null, userAgent?: string | null) {
  let detectedIp = ip ?? null;
  let detectedUA = userAgent ?? null;

  try {
    const h = await headers();

    detectedIp =
      detectedIp ??
      h.get("cf-connecting-ip") ??
      h.get("true-client-ip") ??
      h.get("x-real-ip") ??
      h.get("x-forwarded-for")?.split(",")[0].trim() ??
      null;

    detectedUA = detectedUA ?? h.get("user-agent") ?? null;
  } catch {
    // ignore — not in a request context
  }

  return {
    ip: normalizeIp(detectedIp),
    userAgent: detectedUA,
  };
}

function safeCloneMetadata(meta: Record<string, any>) {
  try {
    return JSON.parse(JSON.stringify(meta));
  } catch {
    return { _error: "Invalid metadata structure" };
  }
}

function maybeEncryptMetadata(
  metadata: Record<string, any>,
  encryptMetadata: boolean
) {
  if (!encryptMetadata) {
    return {
      _encrypted: false,
      encVersion: 1,
      data: metadata,
    };
  }

  return {
    _encrypted: true,
    encVersion: 1,
    payload: encrypt(JSON.stringify(metadata)),
  };
}

/* -------------------------------------------------- */
/* SECURITY EVENT                                      */
/* -------------------------------------------------- */

export async function emitSecurityEvent(params: {
  type: SecurityEventType;
  message: string;
  severity?: Severity;
  userId?: string | null;
  ip?: string | null;
  userAgent?: string | null;
  category?: string | null;
  metadata?: Record<string, any>;
  encryptMetadata?: boolean;
  source?: string | null;
  requestId?: string | null;
}) {
  const {
    type,
    message,
    severity = "low",
    userId = null,
    ip,
    userAgent,
    category,
    metadata = {},
    encryptMetadata = false,
    source = "system",
    requestId = null,
  } = params;

  const sev = normalizeSeverity(severity);
  const normalizedCategory = normalizeCategory(category);

  const safeMetadata = safeCloneMetadata(metadata);
  const storedMetadata = maybeEncryptMetadata(safeMetadata, encryptMetadata);

  const ctx = await extractRequestContext(ip, userAgent);

  try {
    await prisma.securityEvent.create({
      data: {
        version: 1,
        timestamp: new Date().toISOString(),
        type,
        severity: sev,
        category: normalizedCategory,
        source,
        requestId,
        userId,
        ip: ctx.ip,
        userAgent: ctx.userAgent,
        message,
        encryptedMetadata: encryptMetadata,
        metadata: storedMetadata,
      },
    });
  } catch (err) {
    console.error("[SecurityEvent] Failed to write:", err);
  }
}

/* -------------------------------------------------- */
/* FRAUD EVENT                                         */
/* -------------------------------------------------- */

export async function emitFraudEvent(params: {
  signal: FraudSignal;
  orderId?: string | null;
  userId?: string | null;
  ip?: string | null;
  userAgent?: string | null;
  metadata?: Record<string, any>;
  encryptMetadata?: boolean;
  source?: string | null;
  requestId?: string | null;
}) {
  const {
    signal,
    orderId = null,
    userId = null,
    ip,
    userAgent,
    metadata = {},
    encryptMetadata = false,
    source = "system",
    requestId = null,
  } = params;

  const safeMetadata = safeCloneMetadata(metadata);
  const storedMetadata = maybeEncryptMetadata(safeMetadata, encryptMetadata);

  const ctx = await extractRequestContext(ip, userAgent);

  try {
    await prisma.fraudEvent.create({
      data: {
        version: 1,
        timestamp: new Date().toISOString(),
        signal,
        orderId,
        userId,
        source,
        requestId,
        ip: ctx.ip,
        userAgent: ctx.userAgent,
        encryptedMetadata: encryptMetadata,
        metadata: storedMetadata,
      },
    });
  } catch (err) {
    console.error("[FraudEvent] Failed to write:", err);
  }
}

/* -------------------------------------------------- */
/* ALERT EVENT                                         */
/* -------------------------------------------------- */

export async function emitAlertEvent(params: {
  event: AlertEventType;
  userId?: string | null;
  ip?: string | null;
  userAgent?: string | null;
  metadata?: Record<string, any>;
  encryptMetadata?: boolean;
  source?: string | null;
  requestId?: string | null;
}) {
  const {
    event,
    userId = null,
    ip,
    userAgent,
    metadata = {},
    encryptMetadata = false,
    source = "system",
    requestId = null,
  } = params;

  const safeMetadata = safeCloneMetadata(metadata);
  const storedMetadata = maybeEncryptMetadata(safeMetadata, encryptMetadata);

  const ctx = await extractRequestContext(ip, userAgent);

  try {
    await prisma.alertEvent.create({
      data: {
        version: 1,
        timestamp: new Date().toISOString(),
        event,
        userId,
        source,
        requestId,
        ip: ctx.ip,
        userAgent: ctx.userAgent,
        encryptedMetadata: encryptMetadata,
        metadata: storedMetadata,
      },
    });
  } catch (err) {
    console.error("[AlertEvent] Failed to write:", err);
  }
}

// lib/events/pipeline.ts

import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import crypto from "crypto";
import { z } from "zod";
import {
  SECURITY_EVENT_TYPES,
  AUDIT_ACTIONS,
  FRAUD_SIGNALS,
  ALERT_EVENT_TYPES,
} from "@/lib/events/types";
import { processAlert } from "@/lib/audit/alerts";

/* -------------------------------------------------- */
/* Helpers                                             */
/* -------------------------------------------------- */

function normalizeIp(ip?: string | null): string | null {
  if (!ip) return null;

  let clean = ip.split(",")[0].trim();
  clean = clean.replace(/:\d+$/, "");

  const ipv4Match = clean.match(/::ffff:(\d+\.\d+\.\d+\.\d+)/);
  if (ipv4Match) return ipv4Match[1];

  return clean || null;
}

async function enrichContext(ip?: string | null, userAgent?: string | null) {
  try {
    const h = await headers();
    return {
      ip:
        normalizeIp(ip) ??
        normalizeIp(h.get("x-forwarded-for")?.split(",")[0].trim() ?? null),
      userAgent: userAgent ?? h.get("user-agent") ?? null,
    };
  } catch {
    return { ip: normalizeIp(ip), userAgent };
  }
}

/* -------------------------------------------------- */
/* Zod schemas                                         */
/* -------------------------------------------------- */

const baseSchema = z.object({
  kind: z.enum(["security", "audit", "fraud", "alert"]),
  version: z.number(),
  timestamp: z.date(),
  requestId: z.string(),
  correlationId: z.string().nullable().optional(),
  source: z.string(),
  category: z.string(),
  severity: z.enum(["low", "medium", "high"]),
  userId: z.string().nullable().optional(),
  ip: z.string().nullable().optional(),
  userAgent: z.string().nullable().optional(),
  encryptedMetadata: z.boolean(),
  metadata: z.record(z.any()),
});

const securitySchema = baseSchema.extend({
  kind: z.literal("security"),
  type: z.enum(SECURITY_EVENT_TYPES),
  message: z.string(),
});

const auditSchema = baseSchema.extend({
  kind: z.literal("audit"),
  action: z.enum(AUDIT_ACTIONS),
  actorType: z.enum(["USER", "ADMIN", "SYSTEM", "JOB"]),
  resource: z.string().nullable().optional(),
  resourceId: z.string().nullable().optional(),
});

const fraudSchema = baseSchema.extend({
  kind: z.literal("fraud"),
  signal: z.enum(FRAUD_SIGNALS),
  orderId: z.string().nullable().optional(),
});

const alertSchema = baseSchema.extend({
  kind: z.literal("alert"),
  event: z.enum(ALERT_EVENT_TYPES),
});

/* -------------------------------------------------- */
/* Main pipeline                                       */
/* -------------------------------------------------- */

export async function logEvent(event: any) {
  try {
    const ctx = await enrichContext(event.ip, event.userAgent);

    const enriched = {
      ...event,
      ip: ctx.ip,
      userAgent: ctx.userAgent,
      correlationId: event.correlationId ?? crypto.randomUUID(),
    };

    switch (enriched.kind) {
      case "security": {
        const e = securitySchema.parse(enriched);
        const { kind, ...payload } = e;
        await prisma.securityEvent.create({ data: payload });
        break;
      }

      case "audit": {
        const e = auditSchema.parse(enriched);
        const { kind, ...payload } = e;
        await prisma.auditLog.create({ data: payload });
        break;
      }

      case "fraud": {
        const e = fraudSchema.parse(enriched);
        const { kind, ...payload } = e;
        await prisma.fraudEvent.create({ data: payload });
        break;
      }

      case "alert": {
        const e = alertSchema.parse(enriched);
        processAlert({
          action: e.event,
          metadata: e.metadata ?? {},
        }).catch((err) =>
          console.error("Alert processing failed:", err)
        );
        break;
      }
    }
  } catch (err) {
    console.error("Event pipeline error:", err);
  }
}

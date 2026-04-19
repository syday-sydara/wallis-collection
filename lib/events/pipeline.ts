// lib/events/pipeline.ts

import { prisma } from "@/lib/db";
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
/* Base Envelope (v3 unified)                          */
/* -------------------------------------------------- */
const baseSchema = z.object({
  kind: z.enum(["security", "audit", "fraud", "alert"]),
  timestamp: z.string().optional(),
  requestId: z.string().nullable().optional(),
  source: z.string().nullable().optional(),
  category: z.string().nullable().optional(),
  severity: z.enum(["low", "medium", "high"]).optional(),
  userId: z.string().nullable().optional(),
  ip: z.string().nullable().optional(),
  userAgent: z.string().nullable().optional(),
  encryptedMetadata: z.boolean().optional(),
  metadata: z.record(z.any()).optional(),
  version: z.number().default(1),
});

/* -------------------------------------------------- */
/* Security Event Schema                               */
/* -------------------------------------------------- */
const securitySchema = baseSchema.extend({
  kind: z.literal("security"),
  type: z.enum(SECURITY_EVENT_TYPES),
  message: z.string(),
});

/* -------------------------------------------------- */
/* Audit Event Schema                                  */
/* -------------------------------------------------- */
const auditSchema = baseSchema.extend({
  kind: z.literal("audit"),
  action: z.enum(AUDIT_ACTIONS),
  actorType: z.enum(["USER", "ADMIN", "SYSTEM", "JOB"]),
  resource: z.string().nullable().optional(),
  resourceId: z.string().nullable().optional(),
});

/* -------------------------------------------------- */
/* Fraud Event Schema                                  */
/* -------------------------------------------------- */
const fraudSchema = baseSchema.extend({
  kind: z.literal("fraud"),
  signal: z.enum(FRAUD_SIGNALS),
  orderId: z.string().nullable().optional(),
});

/* -------------------------------------------------- */
/* Alert Event Schema                                  */
/* -------------------------------------------------- */
const alertSchema = baseSchema.extend({
  kind: z.literal("alert"),
  event: z.enum(ALERT_EVENT_TYPES),
});

/* -------------------------------------------------- */
/* Main Pipeline                                       */
/* -------------------------------------------------- */
export async function logEvent(event: any) {
  try {
    const h = await headers();

    const ip =
      event.ip ??
      h.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      null;

    const userAgent = event.userAgent ?? h.get("user-agent") ?? null;

    const requestId = event.requestId ?? crypto.randomUUID();

    const timestamp = new Date().toISOString();

    const enriched = {
      ...event,
      ip,
      userAgent,
      requestId,
      timestamp,
      version: event.version ?? 1,
      encryptedMetadata: event.encryptedMetadata ?? false,
    };

    switch (event.kind) {
      case "security": {
        const e = securitySchema.parse(enriched);
        const { kind, encryptedMetadata, ...payload } = e;
        await prisma.securityEvent.create({ data: payload });
        break;
      }

      case "audit": {
        const e = auditSchema.parse(enriched);
        const { kind, encryptedMetadata, ...payload } = e;
        await prisma.auditLog.create({ data: payload });
        break;
      }

      case "fraud": {
        const e = fraudSchema.parse(enriched);
        const { kind, encryptedMetadata, ...payload } = e;
        await prisma.fraudEvent.create({ data: payload });
        break;
      }

      case "alert": {
        const e = alertSchema.parse(enriched);

        // Alerts are processed, not stored
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

// lib/events/pipeline.ts
import { prisma } from "@/lib/db";
import { headers } from "next/headers";
import crypto from "crypto";
import { z } from "zod";
import { processAlert } from "@/lib/audit/alerts";

// Shared base schema
const baseSchema = z.object({
  kind: z.enum(["security", "audit", "fraud", "alert"]),
  metadata: z.record(z.any()).optional(),
  ip: z.string().nullable().optional(),
  userAgent: z.string().nullable().optional(),
  requestId: z.string().optional(),
  version: z.number().default(1),
});

// Individual event schemas
const securitySchema = baseSchema.extend({
  kind: z.literal("security"),
  type: z.string(),
  message: z.string(),
  severity: z.enum(["low", "medium", "high"]).default("low"),
  userId: z.string().nullable().optional(),
});

const auditSchema = baseSchema.extend({
  kind: z.literal("audit"),
  actorType: z.string(),
  action: z.string(),
  resource: z.string(),
  resourceId: z.string(),
  userId: z.string().nullable().optional(),
});

const fraudSchema = baseSchema.extend({
  kind: z.literal("fraud"),
  signal: z.string(),
  orderId: z.string().nullable().optional(),
});

const alertSchema = baseSchema.extend({
  kind: z.literal("alert"),
  event: z.string(),
});

// Main pipeline
export async function logEvent(event: any) {
  try {
    const h = headers();
    const ip = event.ip ?? h.get("x-forwarded-for") ?? null;
    const userAgent = event.userAgent ?? h.get("user-agent") ?? null;
    const requestId = event.requestId ?? crypto.randomUUID();

    const enriched = { ...event, ip, userAgent, requestId };

    switch (event.kind) {
      case "security": {
        const e = securitySchema.parse(enriched);
        await prisma.securityEvent.create({ data: e });
        break;
      }

      case "audit": {
        const e = auditSchema.parse(enriched);
        await prisma.auditEvent.create({ data: e });
        break;
      }

      case "fraud": {
        const e = fraudSchema.parse(enriched);
        await prisma.fraudEvent.create({ data: e });
        break;
      }

      case "alert": {
        const e = alertSchema.parse(enriched);
        processAlert({ action: e.event, metadata: e.metadata ?? {} }).catch(
          (err) => console.error("Alert processing failed:", err)
        );
        break;
      }
    }
  } catch (err) {
    console.error("Event pipeline error:", err);
  }
}
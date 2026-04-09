// lib/audit/log.ts
import { prisma } from "@/lib/db";
import { headers } from "next/headers";
import type { AuditLogInput } from "./types";

function extractRequestContext() {
  try {
    const h = headers();
    const ip =
      h.get("cf-connecting-ip") ??
      h.get("true-client-ip") ??
      h.get("x-real-ip") ??
      h.get("x-forwarded-for")?.split(",")[0].trim() ??
      null;

    const userAgent = h.get("user-agent") ?? null;

    return { ip, userAgent };
  } catch {
    return { ip: null, userAgent: null };
  }
}

export async function logAuditEvent(input: AuditLogInput) {
  const { action, actorType, userId = null, resource = null, resourceId = null, metadata = {} } =
    input;

  const ctx = extractRequestContext();

  try {
    await prisma.auditEvent.create({
      data: {
        kind: "audit",
        version: 1,
        timestamp: new Date().toISOString(),
        action,
        actorType,
        userId,
        resource,
        resourceId,
        ip: ctx.ip,
        userAgent: ctx.userAgent,
        metadata,
      },
    });
  } catch (err) {
    console.error("[AuditEvent] Failed to write:", err);
  }
}

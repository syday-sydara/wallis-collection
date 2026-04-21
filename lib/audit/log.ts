// lib/audit/log.ts
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import type { AuditLogInput } from "./types";

async function extractRequestContext() {
  try {
    const h = await headers();
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

  const ctx = await extractRequestContext();

  try {
    await prisma.auditLog.create({
      data: {
        action,
        actorType,
        userId,
        resource,
        resourceId,
        metadata,
      },
    });
  } catch (err) {
    console.error("[AuditLog] Failed to write:", err);
  }
}

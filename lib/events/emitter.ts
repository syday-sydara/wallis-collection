// lib/events/emitter.ts

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type Severity = "low" | "medium" | "high";

interface BaseEvent {
  ip?: string | null;
  userAgent?: string | null;
  metadata?: Record<string, any>;
}

export async function emitSecurityEvent(
  event: {
    type: string;
    message: string;
    severity: Severity;
    category?: string;
    context?: string;
    source?: string;
    requestId?: string | null;
    actorType: string;
    actorId?: string | null;
    orderId?: string | null;
    fulfillmentId?: string | null;
    riderId?: string | null;
    riskScore?: number;
    tags?: string[];
  } & BaseEvent,
) {
  await prisma.securityEvent.create({
    data: {
      version: 3,
      type: event.type,
      message: event.message,
      severity: event.severity,
      category: event.category ?? null,
      context: event.context ?? null,
      source: event.source ?? null,
      requestId: event.requestId ?? null,
      actorType: event.actorType,
      actorId: event.actorId ?? null,
      orderId: event.orderId ?? null,
      fulfillmentId: event.fulfillmentId ?? null,
      riderId: event.riderId ?? null,
      riskScore: event.riskScore ?? 0,
      tags: event.tags ?? [],
      ip: event.ip ?? null,
      userAgent: event.userAgent ?? null,
      metadata: event.metadata ?? {},
    },
  });
}

export async function emitFraudEvent(
  event: {
    signal: string;
    orderId?: string | null;
    userId?: string | null;
  } & BaseEvent,
) {
  await prisma.fraudEvent.create({
    data: {
      signal: event.signal,
      orderId: event.orderId ?? null,
      userId: event.userId ?? null,
      ip: event.ip ?? null,
      userAgent: event.userAgent ?? null,
      metadata: event.metadata ?? {},
    },
  });
}

export async function emitAlertEvent(
  event: {
    event: string;
    userId?: string | null;
  } & BaseEvent,
) {
  await prisma.alertEvent.create({
    data: {
      event: event.event,
      userId: event.userId ?? null,
      ip: event.ip ?? null,
      userAgent: event.userAgent ?? null,
      metadata: event.metadata ?? {},
    },
  });
}

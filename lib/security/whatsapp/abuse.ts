// lib/security/whatsapp/abuse.ts

import { emitSecurityEvent } from "@/lib/events/emitter";
import { normalizePhone, safeString } from "@/lib/security/normalize";
import { startSpan, metricsWithContext, log, serviceContext } from "@/lib/core";

const VERSION = 1;

export async function logWhatsAppAbuse(params: {
  from: string;
  reason: string;
  metadata?: Record<string, any>;
}) {
  const span = startSpan("security.whatsapp_abuse", params);
  const ctx = serviceContext.get();

  const { from, reason, metadata = {} } = params;

  const normalizedFrom = normalizePhone(from) || from;
  const normalizedReason = safeString(reason).toLowerCase();

  metricsWithContext.increment("whatsapp.abuse.detected");
  metricsWithContext.increment(`whatsapp.abuse.reason.${normalizedReason}`);

  try {
    await emitSecurityEvent({
      type: "WHATSAPP_ABUSE_DETECTED",
      message: `WhatsApp abuse detected: ${normalizedReason}`,
      severity: "medium",
      actorType: "customer",
      actorId: normalizedFrom,
      context: "whatsapp",
      operation: "detect",
      category: "whatsapp",
      tags: [
        "whatsapp",
        "abuse",
        `reason:${normalizedReason}`,
        `from:${normalizedFrom}`,
      ],
      ip: ctx.ip ?? null,
      userAgent: ctx.userAgent ?? null,
      metadata: {
        version: VERSION,
        from: normalizedFrom,
        reason: normalizedReason,
        ...metadata,
      },
      source: "whatsapp_webhook",
    });

    span.end({ success: true });
  } catch (err: any) {
    metricsWithContext.increment("whatsapp.abuse.write_error");
    log.error("Failed to log WhatsApp abuse event", {
      from: normalizedFrom,
      reason: normalizedReason,
      error: err?.message,
    });
    span.end({ success: false, error: err?.message });
  }
}

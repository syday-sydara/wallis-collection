// lib/security/whatsapp-rate.ts

import { emitSecurityEvent, emitAlertEvent } from "@/lib/events/emitter";
import { normalizePhone } from "@/lib/security/normalize";
import { trackWhatsAppMessage } from "@/lib/whatsapp/abuse";

import {
  startSpan,
  metricsWithContext,
  log,
  serviceContext,
} from "@/lib/core";

const VERSION = 1;

export async function logWhatsAppRateLimit(from: string) {
  const span = startSpan("security.whatsapp_rate", { from });

  const ctx = serviceContext.get();

  /* -------------------------------------------------- */
  /* Normalize phone number                              */
  /* -------------------------------------------------- */
  const normalized = normalizePhone(from) || from;

  metricsWithContext.increment("whatsapp.rate_limit.checks");
  metricsWithContext.increment(`whatsapp.rate_limit.from.${normalized}`);

  /* -------------------------------------------------- */
  /* Track frequency using in-memory window              */
  /* -------------------------------------------------- */
  let result;
  try {
    result = trackWhatsAppMessage(normalized);
  } catch (err: any) {
    metricsWithContext.increment("whatsapp.rate_limit.error");
    log.error("WhatsApp rate-limit tracking failed", {
      from: normalized,
      error: err?.message,
    });

    span.end({ error: err?.message });
    return {
      count: 1,
      isHighFrequency: false,
      windowMs: 60000,
    };
  }

  const { count, isHighFrequency, windowMs } = result;

  /* -------------------------------------------------- */
  /* Determine severity                                   */
  /* -------------------------------------------------- */
  const severity =
    count >= 40 ? "high" :
    count >= 25 ? "medium" :
    "low";

  metricsWithContext.increment(`whatsapp.rate_limit.severity.${severity}`);

  /* -------------------------------------------------- */
  /* Emit SecurityEvent (dashboard visibility)           */
  /* -------------------------------------------------- */
  await emitSecurityEvent({
    type: "WHATSAPP_RATE_LIMIT_CHECK",
    message: `WhatsApp message frequency from ${normalized}: ${count} msgs/min`,

    severity,
    actorType: "customer",
    actorId: normalized,

    context: "whatsapp",
    operation: "evaluate",
    category: "whatsapp",

    tags: [
      "whatsapp",
      "rate_limit",
      `count:${count}`,
      `from:${normalized}`,
      `severity:${severity}`,
    ],

    ip: ctx.ip ?? null,
    userAgent: ctx.userAgent ?? null,

    metadata: {
      version: VERSION,
      from: normalized,
      count,
      windowMs,
      isHighFrequency,
    },

    source: "whatsapp_webhook",
  });

  /* -------------------------------------------------- */
  /* Threshold-based alerts                              */
  /* -------------------------------------------------- */

  // Soft warning
  if (count === 25) {
    metricsWithContext.increment("whatsapp.rate_limit.alert.medium");

    emitAlertEvent({
      type: "WHATSAPP_RATE_LIMIT_WARNING",
      severity: "medium",
      kind: "alert",
      metadata: {
        from: normalized,
        count,
        windowMs,
        version: VERSION,
      },
    });
  }

  // Hard abuse alert
  if (count === 40 || isHighFrequency) {
    metricsWithContext.increment("whatsapp.rate_limit.alert.high");

    emitAlertEvent({
      type: "WHATSAPP_RATE_LIMIT_CRITICAL",
      severity: "high",
      kind: "alert",
      metadata: {
        from: normalized,
        count,
        windowMs,
        version: VERSION,
      },
    });
  }

  span.end({
    from: normalized,
    count,
    severity,
    isHighFrequency,
  });

  return result;
}

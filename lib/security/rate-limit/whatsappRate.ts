// lib/security/rate-limit/whatsappRate.ts

import { emitSecurityEvent, emitAlertEvent } from "@/lib/events/emitter";
import { normalizePhone } from "@/lib/security/normalize";
import { trackWhatsAppMessage } from "@/lib/security/whatsapp/rate";
import { startSpan, metricsWithContext, log, serviceContext } from "@/lib/core";

const VERSION = 1;

export async function logWhatsAppRateLimit(from: string) {
  const span = startSpan("security.whatsapp_rate", { from });
  const ctx = serviceContext.get();

  const normalized = normalizePhone(from) || from;

  metricsWithContext.increment("whatsapp.rate_limit.checks");
  metricsWithContext.increment(`whatsapp.rate_limit.from.${normalized}`);

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
      windowMs: 60_000,
    };
  }

  const { count, isHighFrequency, windowMs } = result;

  const severity =
    count >= 40 ? "high" :
    count >= 25 ? "medium" :
    "low";

  metricsWithContext.increment(`whatsapp.rate_limit.severity.${severity}`);

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

  if (count === 25) {
    metricsWithContext.increment("whatsapp.rate_limit.alert.medium");
    await emitAlertEvent({
      event: "WHATSAPP_RATE_LIMIT_WARNING",
      userId: null,
      metadata: {
        from: normalized,
        count,
        windowMs,
        version: VERSION,
      },
    });
  }

  if (count === 40 || isHighFrequency) {
    metricsWithContext.increment("whatsapp.rate_limit.alert.high");
    await emitAlertEvent({
      event: "WHATSAPP_RATE_LIMIT_CRITICAL",
      userId: null,
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

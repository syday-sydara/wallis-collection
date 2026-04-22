// lib/security/whatsapp-rate.ts

import { emitSecurityEvent, emitAlertEvent } from "@/lib/events/emitter";
import { normalizePhone } from "@/lib/security/normalize";
import { trackWhatsAppMessage } from "@/lib/whatsapp/abuse";

const VERSION = 1;

export async function logWhatsAppRateLimit(from: string) {
  const normalized = normalizePhone(from) || from;

  // Track frequency using your in-memory window
  const result = trackWhatsAppMessage(normalized);

  const { count, isHighFrequency, windowMs } = result;

  /* -------------------------------------------------- */
  /* Emit SecurityEvent (dashboard visibility)           */
  /* -------------------------------------------------- */
  await emitSecurityEvent({
    type: "WHATSAPP_RATE_LIMIT_CHECK",
    message: `WhatsApp message frequency from ${normalized}: ${count} msgs/min`,

    severity:
      count >= 40 ? "high" :
      count >= 25 ? "medium" :
      "low",

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
    ],

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
    await emitAlertEvent({
      type: "WHATSAPP_RATE_LIMIT_WARNING",
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
    await emitAlertEvent({
      type: "WHATSAPP_RATE_LIMIT_CRITICAL",
      metadata: {
        from: normalized,
        count,
        windowMs,
        version: VERSION,
      },
    });
  }

  return result;
}

// lib/security/whatsapp.ts

import { emitSecurityEvent } from "@/lib/events/emitter";
import { normalizePhone } from "@/lib/security/normalize";

export async function logWhatsAppAbuse(params: {
  from: string;
  reason: string;
  metadata?: Record<string, any>;
}) {
  const { from, reason, metadata = {} } = params;

  const normalizedFrom = normalizePhone(from);

  await emitSecurityEvent({
    type: "WHATSAPP_ABUSE_DETECTED",
    message: `WhatsApp abuse detected: ${reason}`,

    severity: "medium",

    actorType: "customer",
    actorId: normalizedFrom,

    context: "whatsapp",
    operation: "detect",
    category: "whatsapp",

    tags: [
      "whatsapp",
      "abuse",
      `reason:${reason.toLowerCase()}`,
      `from:${normalizedFrom}`,
    ],

    metadata: {
      from: normalizedFrom,
      reason,
      ...metadata,
    },

    source: "whatsapp_webhook",
  });
}

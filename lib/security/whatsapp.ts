// lib/security/whatsapp.ts
import { logSecurityEvent } from "@/lib/security/log";

export async function logWhatsAppAbuse(params: {
  from: string;
  reason: string;
  metadata?: Record<string, any>;
}) {
  const { from, reason, metadata = {} } = params;

  await logSecurityEvent({
    type: "WHATSAPP_ABUSE_DETECTED",
    message: `WhatsApp abuse detected: ${reason}`,
    severity: "medium",
    actorType: "customer",
    actorId: from,
    context: "whatsapp",
    category: "whatsapp",
    riskScore: 60,
    tags: ["whatsapp", "abuse", reason],
    metadata,
    source: "whatsapp_webhook",
  });
}

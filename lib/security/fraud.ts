// lib/security/fraud.ts
import { logSecurityEvent } from "@/lib/security/events";
import { logEvent } from "@/lib/logger";
import { sendWhatsAppAlert } from "@/lib/alerts/whatsapp";

type FraudSignalType =
  | "WEBHOOK_SIGNATURE_MISMATCH"
  | "WEBHOOK_UNKNOWN_ORDER"
  | "WEBHOOK_DUPLICATE_EXCESSIVE"
  | "WEBHOOK_PROVIDER_MISMATCH";

export async function logFraudSignal(params: {
  type: FraudSignalType;
  provider: string;
  reference?: string;
  ip?: string | null;
  userAgent?: string | null;
  metadata?: Record<string, any>;
}) {
  const { type, provider, reference, ip, userAgent, metadata } = params;

  // 1. Log internally
  logEvent("fraud_signal", { type, provider, reference, ip, metadata }, "warn");

  // 2. Persist to DB
  await logSecurityEvent({
    type,
    message: `Fraud signal detected: ${type} (${provider})`,
    severity: "high",
    ip,
    userAgent,
    metadata: {
      provider,
      reference,
      ...metadata
    }
  });

  // 3. WhatsApp alert for high‑severity events
  await sendWhatsAppAlert({
    to: process.env.WHATSAPP_ADMIN_NUMBER!,
    template: "fraud_alert",
    severity: "high",
    variables: [
      type,
      provider,
      reference ?? "n/a",
      ip ?? "n/a"
    ]
  });
}

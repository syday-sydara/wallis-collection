// lib/security/fraud.ts
import { logSecurityEvent } from "@/lib/security/events";
import { logEvent } from "@/lib/logger";
import { sendWhatsAppAlert } from "@/lib/alerts/whatsapp";
import { computeFraudScore } from "@/lib/security/fraud-score";
import { redis } from "@/lib/redis";
import { encrypt } from "@/lib/security/crypto";

type FraudSignalType =
  | "WEBHOOK_SIGNATURE_MISMATCH"
  | "WEBHOOK_UNKNOWN_ORDER"
  | "WEBHOOK_DUPLICATE_EXCESSIVE"
  | "WEBHOOK_PROVIDER_MISMATCH";

const VALID_SIGNALS = new Set<FraudSignalType>([
  "WEBHOOK_SIGNATURE_MISMATCH",
  "WEBHOOK_UNKNOWN_ORDER",
  "WEBHOOK_DUPLICATE_EXCESSIVE",
  "WEBHOOK_PROVIDER_MISMATCH",
]);

const VERSION = 1;

export async function logFraudSignal(params: {
  type: FraudSignalType;
  provider: string;
  reference?: string;
  ip?: string | null;
  userAgent?: string | null;
  metadata?: Record<string, any>;
  encryptMetadata?: boolean;
}) {
  const {
    type,
    provider,
    reference,
    ip,
    userAgent,
    metadata = {},
    encryptMetadata = false,
  } = params;

  // 1. Validate signal type
  if (!VALID_SIGNALS.has(type)) {
    console.error("Invalid fraud signal:", type);
    return;
  }

  // Normalize provider
  const normalizedProvider = provider.trim().toLowerCase();

  // 2. Rate-limit alerts (avoid spam)
  let isThrottled = false;
  try {
    const rlKey = `fraud:${type}:${reference ?? "none"}`;
    const hits = await redis.incr(rlKey);
    await redis.expire(rlKey, 60);
    isThrottled = hits > 5;
  } catch (err) {
    console.error("Redis unavailable for fraud rate-limit:", err);
  }

  // 3. Compute fraud score
  const fraud = computeFraudScore([type]);

  // 4. Internal structured log
  logEvent(
    "fraud_signal",
    {
      version: VERSION,
      type,
      provider: normalizedProvider,
      reference,
      ip,
      severity: fraud.severity,
      score: fraud.score,
      metadata,
    },
    fraud.severity === "high" ? "warn" : "info"
  );

  // 5. Persist to DB
  const storedMetadata = encryptMetadata
    ? { encrypted: encrypt(JSON.stringify(metadata)) }
    : metadata;

  await logSecurityEvent({
    type,
    category: "fraud",
    message: `Fraud signal detected: ${type} (${normalizedProvider})`,
    severity: fraud.severity,
    ip,
    userAgent,
    metadata: {
      provider: normalizedProvider,
      reference,
      score: fraud.score,
      signals: fraud.signals,
      ...storedMetadata,
    },
  });

  // 6. WhatsApp alert (non-blocking)
  if (fraud.severity === "high" && !isThrottled) {
    sendWhatsAppAlert({
      to: process.env.WHATSAPP_ADMIN_NUMBER!,
      template: "fraud_alert",
      severity: "high",
      variables: [
        type,
        normalizedProvider,
        reference ?? "n/a",
        ip ?? "n/a",
      ],
    }).catch((err) => {
      console.error("Failed to send WhatsApp alert:", err);
    });
  }
}
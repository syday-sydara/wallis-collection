import { computeFraudScore } from "@/lib/security/fraud-score";
import { emitFraudEvent, emitSecurityEvent, emitAlertEvent } from "@/lib/events/emitter";
import { redis } from "@/lib/redis";

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

function normalizeProvider(provider: string) {
  return provider.trim().toLowerCase();
}

function buildRateLimitKey(type: FraudSignalType, provider: string, ip?: string | null) {
  return `fraud:rl:${type}:${provider}:${ip ?? "noip"}`;
}

function buildIdempotencyKey(type: FraudSignalType, reference?: string) {
  return reference ? `fraud:idem:${type}:${reference}` : null;
}

async function checkRateLimit(key: string, limit = 5, ttl = 60) {
  try {
    const hits = await redis.incr(key);
    if (hits === 1) await redis.expire(key, ttl);
    return hits > limit;
  } catch {
    return false;
  }
}

async function checkIdempotency(key: string | null) {
  if (!key) return false;

  try {
    const exists = await redis.get(key);
    if (exists) return true;

    await redis.set(key, "1", { EX: 300 });
    return false;
  } catch {
    return false;
  }
}

export async function logFraudSignal(params: {
  type: FraudSignalType;
  provider: string;
  reference?: string;
  ip?: string | null;
  userAgent?: string | null;
  metadata?: Record<string, any>;
}) {
  const { type, provider, reference, ip, userAgent, metadata = {} } = params;

  if (!VALID_SIGNALS.has(type)) {
    console.error("Invalid fraud signal:", type);
    return;
  }

  const normalizedProvider = normalizeProvider(provider);

  // Idempotency guard
  const idemKey = buildIdempotencyKey(type, reference);
  if (await checkIdempotency(idemKey)) return;

  // Rate limit alerts
  const rlKey = buildRateLimitKey(type, normalizedProvider, ip);
  const isThrottled = await checkRateLimit(rlKey);

  // Compute fraud score (v3 engine)
  const fraud = await computeFraudScore([type], {
    orderId: null,
    userId: null,
    ip,
    userAgent,
  });

  // Emit SecurityEvent (dashboard)
  await emitSecurityEvent({
    type: "FRAUD_SIGNAL",
    message: `Fraud signal detected: ${type}`,
    severity: fraud.severity,
    ip,
    userAgent,
    category: "fraud",
    metadata: {
      provider: normalizedProvider,
      reference,
      score: fraud.score,
      signals: fraud.signals,
    },
  });

  // Emit FraudEvent (forensics)
  await emitFraudEvent({
    signal: type,
    orderId: null,
    userId: null,
    ip,
    userAgent,
    metadata: {
      provider: normalizedProvider,
      reference,
      score: fraud.score,
      breakdown: fraud.breakdown,
    },
    encryptMetadata: true,
  });

  // Emit AlertEvent (if needed)
  if (fraud.decision === "block" && !isThrottled) {
    await emitAlertEvent({
      event: "FRAUD_BLOCK",
      ip,
      userAgent,
      metadata: {
        type,
        provider: normalizedProvider,
        reference,
        score: fraud.score,
      },
    });
  }

  return fraud;
}

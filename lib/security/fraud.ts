// lib/security/fraud/log-fraud-signal.ts

import { computeFraudScore } from "@/lib/security/computeFraudScore";
import {
  emitFraudEvent,
  emitSecurityEvent,
  emitAlertEvent,
} from "@/lib/events/emitter";

import { redis } from "@/lib/redis";

import {
  normalizeIp,
  normalizeUserAgent,
  safeString,
} from "@/lib/security/normalize";

import {
  startSpan,
  metricsWithContext,
  log,
  serviceContext,
} from "@/lib/core";

/* -------------------------------------------------- */
/* Types & Constants                                   */
/* -------------------------------------------------- */

export type FraudSignalType =
  | "WEBHOOK_SIGNATURE_MISMATCH"
  | "WEBHOOK_UNKNOWN_ORDER"
  | "WEBHOOK_DUPLICATE_EXCESSIVE"
  | "WEBHOOK_PROVIDER_MISMATCH"
  | "WEBHOOK_PROCESSING_ERROR"
  | "PAYMENT_VERIFICATION_FAILED";

const VALID_SIGNALS = new Set<FraudSignalType>([
  "WEBHOOK_SIGNATURE_MISMATCH",
  "WEBHOOK_UNKNOWN_ORDER",
  "WEBHOOK_DUPLICATE_EXCESSIVE",
  "WEBHOOK_PROVIDER_MISMATCH",
  "WEBHOOK_PROCESSING_ERROR",
  "PAYMENT_VERIFICATION_FAILED",
]);

const VERSION = 1;

/* -------------------------------------------------- */
/* Helpers                                             */
/* -------------------------------------------------- */

function normalizeProvider(provider: string) {
  return safeString(provider).toLowerCase();
}

function buildRateLimitKey(type: FraudSignalType, provider: string, ip: string) {
  return `fraud:rl:${type}:${provider}:${ip}`;
}

function buildIdempotencyKey(type: FraudSignalType, reference?: string) {
  return reference ? `fraud:idem:${type}:${reference}` : null;
}

async function checkRateLimit(key: string, limit = 5, ttl = 60) {
  try {
    const hits = await redis.incr(key);
    if (hits === 1) await redis.expire(key, ttl);
    return hits > limit;
  } catch (err: any) {
    metricsWithContext.increment("fraud.ratelimit.redis_error");
    log.warn("Fraud rate-limit Redis error", { key, error: err?.message });
    return false;
  }
}

async function checkIdempotency(key: string | null) {
  if (!key) return false;

  try {
    const exists = await redis.get(key);
    if (exists) return true;

    await redis.set(key, "1", { ex: 300 });
    return false;
  } catch (err: any) {
    metricsWithContext.increment("fraud.idempotency.redis_error");
    log.warn("Fraud idempotency Redis error", { key, error: err?.message });
    return false;
  }
}

/* -------------------------------------------------- */
/* Main Function                                       */
/* -------------------------------------------------- */

export async function logFraudSignal(params: {
  type: FraudSignalType;
  provider: string;
  reference?: string;
  ip?: string | null;
  userAgent?: string | null;
  metadata?: Record<string, any>;
}) {
  const span = startSpan("fraud.log_signal", {
    type: params.type,
    provider: params.provider,
    reference: params.reference,
  });

  const ctx = serviceContext.get();

  const { type, provider, reference, ip, userAgent, metadata = {} } = params;

  metricsWithContext.increment("fraud.signal.received");

  /* -------------------------------------------------- */
  /* Validate signal                                     */
  /* -------------------------------------------------- */

  if (!VALID_SIGNALS.has(type)) {
    metricsWithContext.increment("fraud.signal.invalid");
    log.warn("Invalid fraud signal received", { type });
    span.end({ invalid: true });
    return;
  }

  /* -------------------------------------------------- */
  /* Normalize inputs                                    */
  /* -------------------------------------------------- */

  const normalizedProvider = normalizeProvider(provider);
  const normalizedIp = normalizeIp(ip) ?? "unknown";
  const normalizedUA = normalizeUserAgent(userAgent) ?? null;

  /* -------------------------------------------------- */
  /* Idempotency guard                                   */
  /* -------------------------------------------------- */

  const idemKey = buildIdempotencyKey(type, reference);
  if (await checkIdempotency(idemKey)) {
    metricsWithContext.increment("fraud.signal.idempotent_skip");
    span.end({ idempotent: true });
    return;
  }

  /* -------------------------------------------------- */
  /* Rate limit alerts                                   */
  /* -------------------------------------------------- */

  const rlKey = buildRateLimitKey(type, normalizedProvider, normalizedIp);
  const isThrottled = await checkRateLimit(rlKey);

  /* -------------------------------------------------- */
  /* Compute fraud score (v3 engine)                     */
  /* -------------------------------------------------- */

  const fraud = await computeFraudScore([type], {
    orderId: null,
    userId: null,
    ip: normalizedIp,
    userAgent: normalizedUA,
  });

  metricsWithContext.increment(`fraud.signal.severity.${fraud.severity}`);

  /* -------------------------------------------------- */
  /* Emit SecurityEvent (dashboard)                      */
  /* -------------------------------------------------- */

  await emitSecurityEvent({
    type: "FRAUD_SIGNAL",
    message: `Fraud signal detected: ${type}`,
    severity: fraud.severity,
    actorType: "system",
    actorId: null,
    category: "fraud",
    context: "fraud",
    operation: "detect",
    tags: [
      "fraud",
      `fraud:${fraud.severity}`,
      `signal:${type}`,
      `provider:${normalizedProvider}`,
    ],
    ip: normalizedIp,
    userAgent: normalizedUA,
    metadata: {
      version: VERSION,
      provider: normalizedProvider,
      reference,
      score: fraud.score,
      signals: fraud.signals,
      breakdown: fraud.breakdown,
      extra: metadata,
    },
  });

  /* -------------------------------------------------- */
  /* Emit FraudEvent (forensics)                         */
  /* -------------------------------------------------- */

  await emitFraudEvent({
    signal: type,
    orderId: null,
    userId: null,
    ip: normalizedIp,
    userAgent: normalizedUA,
    metadata: {
      version: VERSION,
      provider: normalizedProvider,
      reference,
      score: fraud.score,
      breakdown: fraud.breakdown,
      extra: metadata,
    },
    encryptMetadata: true,
  });

  /* -------------------------------------------------- */
  /* Emit AlertEvent (if needed)                         */
  /* -------------------------------------------------- */

  if (fraud.decision === "block" && !isThrottled) {
    metricsWithContext.increment("fraud.alert.block");

    await emitAlertEvent({
      event: "FRAUD_BLOCK",
      ip: normalizedIp,
      userAgent: normalizedUA,
      metadata: {
        version: VERSION,
        type,
        provider: normalizedProvider,
        reference,
        score: fraud.score,
      },
    });
  }

  span.end({
    severity: fraud.severity,
    decision: fraud.decision,
    throttled: isThrottled,
  });

  return fraud;
}

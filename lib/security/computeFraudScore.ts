import { emitFraudEvent, emitSecurityEvent, emitAlertEvent } from "@/lib/events/emitter";

export type FraudSignal =
  | "WEBHOOK_SIGNATURE_MISMATCH"
  | "WEBHOOK_UNKNOWN_ORDER"
  | "WEBHOOK_DUPLICATE_EXCESSIVE"
  | "WEBHOOK_PROVIDER_MISMATCH"
  | "AMOUNT_MISMATCH"
  | "SUSPICIOUS_IP"
  | "HIGH_VALUE_ORDER";

const FRAUD_WEIGHTS: Record<FraudSignal, number> = {
  WEBHOOK_SIGNATURE_MISMATCH: 70,
  WEBHOOK_UNKNOWN_ORDER: 50,
  WEBHOOK_DUPLICATE_EXCESSIVE: 25,
  WEBHOOK_PROVIDER_MISMATCH: 40,
  AMOUNT_MISMATCH: 40,
  SUSPICIOUS_IP: 30,
  HIGH_VALUE_ORDER: 25,
};

const CRITICAL_SIGNALS: FraudSignal[] = [
  "WEBHOOK_SIGNATURE_MISMATCH",
];

const VERSION = 1;

function normalizeSignal(s: string): string {
  return s.trim().toUpperCase();
}

export async function computeFraudScore(inputSignals: string[], context: {
  orderId?: string | null;
  userId?: string | null;
  ip?: string | null;
  userAgent?: string | null;
}) {
  const unique = Array.from(new Set(inputSignals.map(normalizeSignal)));

  const validSignals = unique.filter((s): s is FraudSignal =>
    Object.prototype.hasOwnProperty.call(FRAUD_WEIGHTS, s)
  );

  const hasCritical = validSignals.some((s) =>
    CRITICAL_SIGNALS.includes(s)
  );

  let score = validSignals.reduce(
    (sum, s) => sum + FRAUD_WEIGHTS[s],
    0
  );

  // Interaction boosts
  if (
    validSignals.includes("AMOUNT_MISMATCH") &&
    validSignals.includes("WEBHOOK_PROVIDER_MISMATCH")
  ) {
    score += 20;
  }

  if (validSignals.length >= 3) {
    score += 15;
  }

  score = Math.min(score, 100);

  const severity = classifyFraudScore(score, hasCritical);
  const confidence = computeConfidence(validSignals, hasCritical);
  const decision = computeDecision(score, hasCritical);

  const breakdown = validSignals.map((s) => ({
    signal: s,
    weight: FRAUD_WEIGHTS[s],
  }));

  /* -------------------------------------------------- */
  /* Emit FraudEvent (for forensics)                    */
  /* -------------------------------------------------- */
  await emitFraudEvent({
    signal: "FRAUD_SCORE_COMPUTED",
    orderId: context.orderId,
    userId: context.userId,
    ip: context.ip,
    userAgent: context.userAgent,
    metadata: {
      version: VERSION,
      score,
      severity,
      decision,
      confidence,
      breakdown,
      signals: validSignals,
    },
    encryptMetadata: true,
  });

  /* -------------------------------------------------- */
  /* Emit SecurityEvent (for dashboard)                 */
  /* -------------------------------------------------- */
  await emitSecurityEvent({
    type: "FRAUD_SCORE",
    message: `Fraud score computed: ${score}`,
    severity,
    userId: context.userId,
    ip: context.ip,
    userAgent: context.userAgent,
    category: "fraud",
    metadata: {
      score,
      decision,
      signals: validSignals,
    },
    encryptMetadata: false,
  });

  /* -------------------------------------------------- */
  /* Emit AlertEvent (if needed)                        */
  /* -------------------------------------------------- */
  if (decision === "block") {
    await emitAlertEvent({
      event: "FRAUD_BLOCK",
      userId: context.userId,
      ip: context.ip,
      userAgent: context.userAgent,
      metadata: { score, signals: validSignals },
    });
  }

  return {
    version: VERSION,
    score,
    severity,
    signals: validSignals,
    breakdown,
    confidence,
    decision,
  };
}

export function classifyFraudScore(
  score: number,
  hasCritical: boolean
): "low" | "medium" | "high" {
  if (hasCritical) return "high";
  if (score >= 80) return "high";
  if (score >= 40) return "medium";
  return "low";
}

function computeConfidence(
  signals: FraudSignal[],
  hasCritical: boolean
) {
  if (hasCritical) return 0.95;

  const weightSum = signals.reduce(
    (sum, s) => sum + FRAUD_WEIGHTS[s],
    0
  );

  return Math.min(0.9, weightSum / 100);
}

function computeDecision(score: number, hasCritical: boolean) {
  if (hasCritical || score >= 85) {
    return "block";
  }
  if (score >= 50) {
    return "review";
  }
  return "allow";
}

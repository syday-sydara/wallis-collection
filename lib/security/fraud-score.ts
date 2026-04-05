// lib/security/fraud-score.ts

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

// Signals that immediately classify as "high"
const CRITICAL_SIGNALS: FraudSignal[] = [
  "WEBHOOK_SIGNATURE_MISMATCH",
];

// Optional: versioning for analytics
const VERSION = 1;

export function computeFraudScore(signals: FraudSignal[]) {
  // Normalize + dedupe
  const unique = Array.from(new Set(signals.map((s) => s.trim())));

  // Validate signals at runtime
  const validSignals = unique.filter((s): s is FraudSignal =>
    s in FRAUD_WEIGHTS
  );

  const hasCritical = validSignals.some((s) =>
    CRITICAL_SIGNALS.includes(s)
  );

  const rawScore = validSignals.reduce(
    (sum, s) => sum + FRAUD_WEIGHTS[s],
    0
  );

  // Soft boost: multiple signals = more suspicious
  const multiSignalBoost = validSignals.length > 3 ? 10 : 0;

  const score = Math.min(rawScore + multiSignalBoost, 100);

  return {
    version: VERSION,
    score,
    severity: classifyFraudScore(score, hasCritical),
    signals: validSignals,
    breakdown: validSignals.map((s) => ({
      signal: s,
      weight: FRAUD_WEIGHTS[s],
    })),
    confidence: computeConfidence(validSignals),
  };
}

export function classifyFraudScore(
  score: number,
  hasCritical = false
): "low" | "medium" | "high" {
  if (hasCritical) return "high";
  if (score >= 80) return "high";
  if (score >= 40) return "medium";
  return "low";
}

// Confidence = how reliable the score is
function computeConfidence(signals: FraudSignal[]) {
  if (signals.length === 0) return 0.2;
  if (signals.length === 1) return 0.5;
  if (signals.length === 2) return 0.7;
  if (signals.length >= 3) return 0.9;
  return 0.5;
}
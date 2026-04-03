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
  HIGH_VALUE_ORDER: 25
};

export function computeFraudScore(signals: FraudSignal[]): number {
  const unique = Array.from(new Set(signals));
  return unique.reduce((sum, s) => sum + (FRAUD_WEIGHTS[s] ?? 0), 0);
}

export function classifyFraudScore(score: number):
  | "low"
  | "medium"
  | "high" {
  if (score >= 80) return "high";
  if (score >= 40) return "medium";
  return "low";
}

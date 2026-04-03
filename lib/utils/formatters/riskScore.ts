// lib/utils/formatters/riskScore.ts

export type RiskCategory = "payment" | "address" | "device" | "behavior";

export interface RiskSignal {
  label: string;       // e.g. "Card BIN mismatch"
  weight: number;      // 0–100 contribution
}

export type RiskInput = Record<RiskCategory, RiskSignal[]>;

export interface RiskScoreResult {
  total: number;       // final 0–100 score
  breakdown: Record<RiskCategory, number>;
}

/**
 * Calculate a category-based risk score (0–100).
 *
 * Each category contains multiple signals, each with a weight.
 * Category totals are normalized and combined.
 */
export function calculateCategoryRiskScore(
  input: RiskInput,
  categoryWeights: Partial<Record<RiskCategory, number>> = {}
): RiskScoreResult {
  const defaultCategoryWeight = 1;

  const breakdown: Record<RiskCategory, number> = {
    payment: 0,
    address: 0,
    device: 0,
    behavior: 0
  };

  let combinedScore = 0;
  let combinedWeight = 0;

  for (const category of Object.keys(breakdown) as RiskCategory[]) {
    const signals = input[category] || [];
    const categoryWeight = categoryWeights[category] ?? defaultCategoryWeight;

    // Sum valid signal weights
    const categoryScore = signals.reduce((acc, s) => {
      const value = Number(s.weight);
      return Number.isFinite(value) ? acc + Math.max(0, value) : acc;
    }, 0);

    // Clamp category score to 0–100
    const normalized = Math.min(100, categoryScore);

    breakdown[category] = normalized;

    combinedScore += normalized * categoryWeight;
    combinedWeight += categoryWeight;
  }

  // Final normalized score (0–100)
  const total = combinedWeight > 0
    ? Math.min(100, combinedScore / combinedWeight)
    : 0;

  return { total, breakdown };
}

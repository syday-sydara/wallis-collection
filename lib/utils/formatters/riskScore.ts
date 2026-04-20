// lib/utils/formatters/riskScore.ts

export type RiskCategory = "payment" | "address" | "device" | "behavior";

export interface RiskSignal {
  label: string;
  weight: number; // can be positive or negative
}

export type RiskInput = Record<RiskCategory, RiskSignal[]>;

export interface RiskScoreResult {
  total: number;
  breakdown: Record<RiskCategory, number>;
}

/**
 * Calculate a weighted, normalized risk score (0–100).
 *
 * - Supports positive and negative signals
 * - Automatically normalizes category weights
 * - Clamps final scores to 0–100
 */
export function calculateCategoryRiskScore(
  input: RiskInput,
  categoryWeights: Partial<Record<RiskCategory, number>> = {},
  strict = false
): RiskScoreResult {
  const categories: RiskCategory[] = [
    "payment",
    "address",
    "device",
    "behavior",
  ];

  // Normalize category weights so they sum to 1
  const rawWeights = categories.map(
    (c) => categoryWeights[c] ?? 1 // default weight = 1
  );
  const weightSum = rawWeights.reduce((a, b) => a + b, 0);
  const normalizedWeights = rawWeights.map((w) => w / weightSum);

  const breakdown: Record<RiskCategory, number> = {
    payment: 0,
    address: 0,
    device: 0,
    behavior: 0,
  };

  let total = 0;

  categories.forEach((category, i) => {
    const signals = input[category];

    if (!signals) {
      if (strict) {
        throw new Error(`Missing risk category: ${category}`);
      }
      breakdown[category] = 0;
      return;
    }

    // Sum all signal weights (positive or negative)
    const rawScore = signals.reduce((acc, s) => {
      const value = Number(s.weight);
      return Number.isFinite(value) ? acc + value : acc;
    }, 0);

    // Clamp category score to 0–100
    const categoryScore = Math.min(100, Math.max(0, rawScore));

    breakdown[category] = categoryScore;

    // Weighted contribution
    total += categoryScore * normalizedWeights[i];
  });

  // Clamp final score
  const finalScore = Math.min(100, Math.max(0, total));

  return Object.freeze({
    total: finalScore,
    breakdown: Object.freeze(breakdown),
  });
}

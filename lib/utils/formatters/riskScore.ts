export type RiskCategory = "payment" | "address" | "device" | "behavior";

export interface RiskSignal {
  label: string;
  weight: number;
}

export type RiskInput = Record<RiskCategory, RiskSignal[]>;

export interface RiskScoreResult {
  total: number;
  breakdown: Record<RiskCategory, number>;
}

export function calculateCategoryRiskScore(
  input: RiskInput,
  categoryWeights: Partial<Record<RiskCategory, number>> = {},
  strict = false
): RiskScoreResult {
  const categories: RiskCategory[] = ["payment","address","device","behavior"];

  const rawWeights = categories.map((c) => categoryWeights[c] ?? 1);
  const weightSum = rawWeights.reduce((a, b) => a + b, 0);
  const normalizedWeights = rawWeights.map((w) => w / weightSum);

  const breakdown = { payment: 0, address: 0, device: 0, behavior: 0 };

  let total = 0;

  categories.forEach((category, i) => {
    const signals = input[category];

    if (!signals) {
      if (strict) throw new Error(`Missing risk category: ${category}`);
      return;
    }

    const rawScore = signals.reduce((acc, s) => acc + s.weight, 0);
    const categoryScore = Math.min(100, Math.max(0, rawScore));

    breakdown[category] = categoryScore;
    total += categoryScore * normalizedWeights[i];
  });

  return Object.freeze({
    total: Math.min(100, Math.max(0, total)),
    breakdown: Object.freeze(breakdown),
  });
}

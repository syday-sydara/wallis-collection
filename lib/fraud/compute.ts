// lib/fraud-combiner.ts

export interface FraudSignal {
  name: string;
  score: number; // 0–100
  weight?: number; // default: 1
  reasons?: string[];
}

export interface CombinedFraudScore {
  finalScore: number; // 0–100
  level: "LOW" | "MEDIUM" | "HIGH";
  signals: FraudSignal[];
  reasons: string[];
}

/* ---------------------------------- */
/* Combine multiple fraud signals     */
/* ---------------------------------- */
export function combineFraudScores(signals: FraudSignal[]): CombinedFraudScore {
  let weightedTotal = 0;
  let weightSum = 0;
  const reasons: string[] = [];

  for (const signal of signals) {
    const weight = signal.weight ?? 1;

    weightedTotal += signal.score * weight;
    weightSum += weight;

    if (signal.reasons?.length) {
      reasons.push(...signal.reasons.map((r) => `${signal.name}: ${r}`));
    }
  }

  const finalScore = Math.min(
    100,
    Math.max(0, Math.round(weightedTotal / weightSum))
  );

  let level: "LOW" | "MEDIUM" | "HIGH" = "LOW";
  if (finalScore >= 70) level = "HIGH";
  else if (finalScore >= 40) level = "MEDIUM";

  return {
    finalScore,
    level,
    signals,
    reasons,
  };
}

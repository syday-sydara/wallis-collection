// lib/utils/formatters/riskEngine.ts

export type RiskCategory = "payment" | "address" | "device" | "behavior";

export interface RiskSignal {
  label: string;
  weight: number; // positive or negative
  decayDays?: number; // optional time-based decay
  timestamp?: number; // when the signal occurred
}

export interface RiskScoreResult {
  total: number;
  level: "low" | "medium" | "high";
  breakdown: Record<RiskCategory, number>;
  signals: Array<RiskSignal & { category: RiskCategory }>;
}

export interface RiskThresholds {
  low: number;
  medium: number;
  high: number;
}

export interface RiskProfile {
  categoryWeights?: Partial<Record<RiskCategory, number>>;
  categoryCaps?: Partial<Record<RiskCategory, number>>;
  thresholds?: RiskThresholds;
}

export type RiskPlugin = (engine: RiskEngine) => void;

/* -------------------------------------------------- */
/* RiskEngine Class                                    */
/* -------------------------------------------------- */

export class RiskEngine {
  private categories: RiskCategory[] = [
    "payment",
    "address",
    "device",
    "behavior",
  ];

  private signals: Record<RiskCategory, RiskSignal[]> = {
    payment: [],
    address: [],
    device: [],
    behavior: [],
  };

  private categoryWeights: Record<RiskCategory, number> = {
    payment: 1,
    address: 1,
    device: 1,
    behavior: 1,
  };

  private categoryCaps: Partial<Record<RiskCategory, number>> = {};

  private thresholds: RiskThresholds = {
    low: 30,
    medium: 60,
    high: 85,
  };

  private strict = false;

  /* -------------------------------------------------- */
  /* Configuration                                       */
  /* -------------------------------------------------- */

  setStrictMode(enabled: boolean) {
    this.strict = enabled;
    return this;
  }

  setCategoryWeight(category: RiskCategory, weight: number) {
    this.categoryWeights[category] = weight;
    return this;
  }

  setCategoryCap(category: RiskCategory, cap: number) {
    this.categoryCaps[category] = cap;
    return this;
  }

  setThresholds(thresholds: Partial<RiskThresholds>) {
    this.thresholds = { ...this.thresholds, ...thresholds };
    return this;
  }

  useProfile(profile: RiskProfile) {
    if (profile.categoryWeights) {
      Object.assign(this.categoryWeights, profile.categoryWeights);
    }
    if (profile.categoryCaps) {
      Object.assign(this.categoryCaps, profile.categoryCaps);
    }
    if (profile.thresholds) {
      this.setThresholds(profile.thresholds);
    }
    return this;
  }

  use(plugin: RiskPlugin) {
    plugin(this);
    return this;
  }

  /* -------------------------------------------------- */
  /* Signal registration                                 */
  /* -------------------------------------------------- */

  addSignal(
    category: RiskCategory,
    label: string,
    weight: number,
    opts?: { decayDays?: number; timestamp?: number }
  ) {
    this.signals[category].push({
      label,
      weight,
      decayDays: opts?.decayDays,
      timestamp: opts?.timestamp ?? Date.now(),
    });
    return this;
  }

  /* -------------------------------------------------- */
  /* Internal helpers                                    */
  /* -------------------------------------------------- */

  private applyDecay(signal: RiskSignal): number {
    if (!signal.decayDays || !signal.timestamp) return signal.weight;

    const ageMs = Date.now() - signal.timestamp;
    const decayMs = signal.decayDays * 24 * 60 * 60 * 1000;

    if (ageMs >= decayMs) return 0;

    const remaining = 1 - ageMs / decayMs;
    return signal.weight * remaining;
  }

  private normalizeWeights(): number[] {
    const raw = this.categories.map((c) => this.categoryWeights[c]);
    const sum = raw.reduce((a, b) => a + b, 0);
    return raw.map((w) => w / sum);
  }

  /* -------------------------------------------------- */
  /* Scoring                                             */
  /* -------------------------------------------------- */

  calculate(): RiskScoreResult {
    const normalizedWeights = this.normalizeWeights();

    const breakdown: Record<RiskCategory, number> = {
      payment: 0,
      address: 0,
      device: 0,
      behavior: 0,
    };

    let total = 0;

    this.categories.forEach((category, i) => {
      const signals = this.signals[category];

      if (!signals.length && this.strict) {
        throw new Error(`Missing risk category: ${category}`);
      }

      const rawScore = signals.reduce((acc, s) => {
        const decayed = this.applyDecay(s);
        return acc + (Number.isFinite(decayed) ? decayed : 0);
      }, 0);

      let categoryScore = Math.min(100, Math.max(0, rawScore));

      if (this.categoryCaps[category] != null) {
        categoryScore = Math.min(categoryScore, this.categoryCaps[category]!);
      }

      breakdown[category] = categoryScore;

      total += categoryScore * normalizedWeights[i];
    });

    const finalScore = Math.min(100, Math.max(0, total));

    const level =
      finalScore >= this.thresholds.high
        ? "high"
        : finalScore >= this.thresholds.medium
        ? "medium"
        : "low";

    const allSignals = this.categories.flatMap((category) =>
      this.signals[category].map((s) => ({ ...s, category }))
    );

    return Object.freeze({
      total: finalScore,
      level,
      breakdown: Object.freeze(breakdown),
      signals: Object.freeze(allSignals),
    });
  }
}

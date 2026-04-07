type Signals = {
  failedLogins?: number;
  newDevice?: boolean;
  ipMismatch?: boolean;
  highVelocity?: boolean;
  deviceMismatch?: boolean;
  unusualLocation?: boolean;
  rapidOtpRequests?: boolean;
};

type SignalKey = keyof Signals;

interface UnifiedRiskResult {
  total: number;
  confidence: number;
  breakdown: Record<SignalKey, number>;
  severity: "low" | "medium" | "high";
  signalsUsed: number;
}

const CONFIG: Record<
  SignalKey,
  { weight: number; maxContribution?: number }
> = {
  failedLogins: { weight: 12, maxContribution: 60 },
  newDevice: { weight: 25 },
  ipMismatch: { weight: 20 },
  highVelocity: { weight: 30 },
  deviceMismatch: { weight: 18 },
  unusualLocation: { weight: 15 },
  rapidOtpRequests: { weight: 22 },
};

export function computeUnifiedRisk(
  signals: Signals = {}
): UnifiedRiskResult {
  let total = 0;
  let signalsUsed = 0;
  let confidenceWeight = 0;

  const breakdown = {} as Record<SignalKey, number>;

  for (const key in CONFIG) {
    const { weight, maxContribution } = CONFIG[key];
    const value = signals[key];

    if (value === undefined) {
      breakdown[key] = 0;
      continue;
    }

    signalsUsed++;

    let contribution = 0;

    if (typeof value === "number") {
      contribution = value * weight;
      if (maxContribution) {
        contribution = Math.min(contribution, maxContribution);
      }
    } else if (value === true) {
      contribution = weight;
    }

    breakdown[key] = contribution;
    total += contribution;

    // Confidence weighted by signal importance
    confidenceWeight += weight;
  }

  // Normalize total to 0–100
  const MAX_TOTAL = 150; // tune this based on real data
  total = Math.min(100, (total / MAX_TOTAL) * 100);

  // Confidence based on signal strength, not just count
  const confidence = Math.min(1, confidenceWeight / 100);

  const severity =
    total >= 75 ? "high" :
    total >= 45 ? "medium" :
    "low";

  return {
    total: Math.round(total),
    confidence: Number(confidence.toFixed(2)),
    breakdown,
    severity,
    signalsUsed,
  };
}
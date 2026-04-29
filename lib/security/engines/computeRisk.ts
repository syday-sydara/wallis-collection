// lib/security/engines/computeRisk.ts

export function computeRisk(signals: {
  failedLogins?: number;
  newDevice?: boolean;
  ipMismatch?: boolean;
  highVelocity?: boolean;
} = {}) {
  const WEIGHTS = {
    failedLogins: 10,
    newDevice: 25,
    ipMismatch: 20,
    highVelocity: 30,
  };

  const breakdown = {
    failedLogins: 0,
    newDevice: 0,
    ipMismatch: 0,
    highVelocity: 0,
  };

  let score = 0;
  let confidenceWeight = 0;
  const reasons: string[] = [];

  const failed = Math.max(0, signals.failedLogins ?? 0);
  const failedScore = Math.min(failed, 5) * WEIGHTS.failedLogins;

  if (failedScore > 0) {
    breakdown.failedLogins = failedScore;
    score += failedScore;
    confidenceWeight += WEIGHTS.failedLogins;
    reasons.push("failed_logins");
  }

  if (signals.newDevice) {
    breakdown.newDevice = WEIGHTS.newDevice;
    score += WEIGHTS.newDevice;
    confidenceWeight += WEIGHTS.newDevice;
    reasons.push("new_device");
  }

  if (signals.ipMismatch) {
    breakdown.ipMismatch = WEIGHTS.ipMismatch;
    score += WEIGHTS.ipMismatch;
    confidenceWeight += WEIGHTS.ipMismatch;
    reasons.push("ip_mismatch");
  }

  if (signals.highVelocity) {
    breakdown.highVelocity = WEIGHTS.highVelocity;
    score += WEIGHTS.highVelocity;
    confidenceWeight += WEIGHTS.highVelocity;
    reasons.push("high_velocity");
  }

  const finalScore = Math.min(score, 100);

  const severity =
    finalScore >= 70 ? "high" :
    finalScore >= 40 ? "medium" :
    "low";

  const confidence = Math.min(1, confidenceWeight / 100);

  return {
    score: finalScore,
    severity,
    confidence: Number(confidence.toFixed(2)),
    breakdown,
    signalsUsed: reasons.length,
    reasons,
    tags: reasons.map((r) => `signal:${r}`),
  };
}

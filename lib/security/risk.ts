type Signals = {
  failedLogins?: number;
  newDevice?: boolean;
  ipMismatch?: boolean;
  highVelocity?: boolean;
};

const WEIGHTS = {
  failedLogin: 10,
  newDevice: 25,
  ipMismatch: 20,
  highVelocity: 30,
};

export function computeRisk(signals: Signals = {}) {
  let score = 0;
  const reasons: string[] = [];

  const failedLogins = Math.max(0, signals.failedLogins ?? 0);
  const failedScore = Math.min(failedLogins, 5) * WEIGHTS.failedLogin;

  if (failedScore > 0) {
    score += failedScore;
    reasons.push("failed_logins");
  }

  if (signals.newDevice) {
    score += WEIGHTS.newDevice;
    reasons.push("new_device");
  }

  if (signals.ipMismatch) {
    score += WEIGHTS.ipMismatch;
    reasons.push("ip_mismatch");
  }

  if (signals.highVelocity) {
    score += WEIGHTS.highVelocity;
    reasons.push("high_velocity");
  }

  return {
    score: Math.min(score, 100),
    level: getRiskLevel(score),
    reasons,
  };
}

function getRiskLevel(score: number) {
  if (score >= 70) return "high";
  if (score >= 40) return "medium";
  return "low";
}
// lib/security/engines/computeRisk.ts

export function computeRisk(signals: {
  failedLogins?: number;
  newDevice?: boolean;
  ipMismatch?: boolean;
  highVelocity?: boolean;
} = {}) {
  return {
    score: 0,
    severity: "low",
    confidence: 0,
    breakdown: {
      failedLogins: 0,
      newDevice: 0,
      ipMismatch: 0,
      highVelocity: 0,
    },
    signalsUsed: 0,
    reasons: [],
    tags: [],
  };
}

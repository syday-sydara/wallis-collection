type Signals = {
  failedLogins?: number;
  newDevice?: boolean;
  ipMismatch?: boolean;
  highVelocity?: boolean;
};

export function computeRisk(signals: Signals): number {
  let score = 0;

  if (signals.failedLogins) score += signals.failedLogins * 10;
  if (signals.newDevice) score += 25;
  if (signals.ipMismatch) score += 20;
  if (signals.highVelocity) score += 30;

  return Math.min(score, 100);
}
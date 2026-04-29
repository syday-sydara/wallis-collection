// lib/security/engines/computeFraudScore.ts

export async function computeFraudScore(
  signals: string[],
  context: {
    userId?: string | null;
    ip?: string | null;
    userAgent?: string | null;
  }
) {
  return {
    score: 0,
    confidence: 0,
    signals,
  };
}

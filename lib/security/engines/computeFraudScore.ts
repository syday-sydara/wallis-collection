// lib/security/engines/computeFraudScore.ts

export async function computeFraudScore(
  signals: string[],
  _context: {
    userId?: string | null;
    ip?: string | null;
    userAgent?: string | null;
  },
) {
  const unique = Array.from(new Set(signals));
  const score = Math.min(100, unique.length * 10);
  const confidence = Math.min(1, unique.length * 0.1);

  return {
    score,
    confidence: Number(confidence.toFixed(2)),
    signals: unique,
  };
}

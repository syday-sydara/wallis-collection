// lib/security/engines/computeUnifiedRisk.ts

export async function computeUnifiedRisk(
  signals: Record<string, any>,
  _context: {
    userId?: string | null;
    ip?: string | null;
    userAgent?: string | null;
    source?: string | null;
  }
) {
  // placeholder: sum some numeric signals if present
  const numericKeys = Object.keys(signals).filter(
    (k) => typeof signals[k] === "number"
  );
  const totalRaw = numericKeys.reduce((acc, k) => acc + (signals[k] as number), 0);
  const total = Math.min(100, Math.max(0, Math.round(totalRaw)));

  return {
    total,
    confidence: numericKeys.length > 0 ? 0.7 : 0.3,
    tags: numericKeys.map((k) => `unified:${k}`),
  };
}

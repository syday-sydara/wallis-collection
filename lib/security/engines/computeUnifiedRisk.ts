// lib/security/engines/computeUnifiedRisk.ts

export async function computeUnifiedRisk(
  signals: Record<string, any>,
  context: {
    userId?: string | null;
    ip?: string | null;
    userAgent?: string | null;
    source?: string | null;
  }
) {
  return {
    total: 0,
    confidence: 0,
    tags: [],
  };
}

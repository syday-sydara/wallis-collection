// lib/security/engines/computeWhatsAppAbuse.ts

export function computeWhatsAppAbuse(input: {
  reasons: string[];
  count?: number;
  highFrequency?: boolean;
}) {
  const reasons = input.reasons ?? [];
  const count = input.count ?? 0;
  const highFreq = input.highFrequency ?? false;

  let score = 0;
  let confidence = 0;

  if (reasons.length > 0) {
    score += Math.min(reasons.length * 10, 30);
    confidence += 0.2;
  }

  if (count >= 25) {
    score += 20;
    confidence += 0.2;
  }

  if (highFreq) {
    score += 30;
    confidence += 0.3;
  }

  score = Math.min(score, 100);
  confidence = Math.min(confidence, 1);

  const tags = [
    ...reasons.map((r) => `whatsapp:${r}`),
    highFreq ? "whatsapp:high_frequency" : null,
  ].filter(Boolean) as string[];

  return {
    score,
    confidence,
    reasons,
    tags,
  };
}

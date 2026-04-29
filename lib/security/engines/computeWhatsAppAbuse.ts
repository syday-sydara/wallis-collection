// lib/security/engines/computeWhatsAppAbuse.ts

export function computeWhatsAppAbuse(input: {
  reasons: string[];
  count?: number;
  highFrequency?: boolean;
}) {
  return {
    score: 0,
    confidence: 0,
    reasons: input.reasons ?? [],
    tags: [],
  };
}

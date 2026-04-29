// lib/security/engines/unifiedRiskEngine.ts

export async function computeUnifiedSecurityRisk(input: any) {
  return {
    version: 1,
    score: 0,
    severity: "low",
    confidence: 0,
    decision: "allow",
    engines: {},
    tags: [],
  };
}

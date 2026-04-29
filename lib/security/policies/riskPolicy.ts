// lib/security/policies/riskPolicy.ts

export function applyRiskPolicy(result: any) {
  return result.decision ?? "allow";
}

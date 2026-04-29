// lib/security/policies/riskPolicy.ts

import { UnifiedRiskOutput } from "@/lib/security/engines/unifiedRiskEngine";

export type RiskAction = "allow" | "challenge" | "block";

export function applyRiskPolicy(result: UnifiedRiskOutput): RiskAction {
  if (result.decision === "block") return "block";
  if (result.decision === "review") return "challenge";
  return "allow";
}

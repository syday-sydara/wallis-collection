// lib/risk/service.ts
import type { RiskContext } from "@/lib/risk/types";
import { getRiskPolicy } from "@/lib/risk/policy";
import { evaluatePolicy } from "@/lib/risk/engine";

export async function evaluateRisk(
  context: RiskContext,
  policyId: string = "default"
) {
  const policy = getRiskPolicy(policyId);
  return evaluatePolicy(context, policy.id);
}

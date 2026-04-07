// lib/risk/policy.ts
import type { RiskPolicy } from "@/lib/risk/types";
import { defaultRiskPolicy } from "@/lib/risk/rules/default";

const policies: Record<string, RiskPolicy> = {
  [defaultRiskPolicy.id]: defaultRiskPolicy,
};

export function getRiskPolicy(id: string = "default"): RiskPolicy {
  const policy = policies[id];
  if (!policy) {
    throw new Error(`RiskPolicy not found: ${id}`);
  }
  return policy;
}

export function listRiskPolicies(): RiskPolicy[] {
  return Object.values(policies);
}

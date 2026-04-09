// lib/risk/admin.ts
import type { RiskPolicy, RiskRule } from "@/lib/risk/types";
import { getRiskPolicy, listRiskPolicies } from "@/lib/risk/policy";

export function getPolicyForAdmin(id: string = "default"): RiskPolicy {
  return getRiskPolicy(id);
}

export function listPoliciesForAdmin(): RiskPolicy[] {
  return listRiskPolicies();
}

export function describeRule(rule: RiskRule) {
  return {
    id: rule.id,
    label: rule.label,
    weight: rule.weight,
    description: rule.description ?? "",
    condition: rule.condition,
  };
}

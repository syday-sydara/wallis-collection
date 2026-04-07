// lib/risk/policy.ts

import type { RiskPolicy } from "@/lib/risk/types";
import { defaultRiskPolicy } from "@/lib/risk/rules/default";

/**
 * In v3, policies are code-defined (Option B).
 * This registry allows you to add more policies later.
 */
const policies: Record<string, RiskPolicy> = {
  [defaultRiskPolicy.id]: defaultRiskPolicy,
};

/**
 * Load a risk policy by ID.
 * Defaults to the "default" policy.
 */
export function getRiskPolicy(id: string = "default"): RiskPolicy {
  const policy = policies[id];
  if (!policy) {
    throw new Error(`RiskPolicy not found: ${id}`);
  }
  return policy;
}

/**
 * List all available policies.
 */
export function listRiskPolicies(): RiskPolicy[] {
  return Object.values(policies);
}

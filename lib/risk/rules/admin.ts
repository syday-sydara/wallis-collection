// lib/risk/admin.ts

import type { RiskPolicy, RiskRule } from "@/lib/risk/types";
import { getRiskPolicy, listRiskPolicies } from "@/lib/risk/rules/policy";

/* -------------------------------------------------- */
/* Fetch a single policy for admin                     */
/* -------------------------------------------------- */

export function getPolicyForAdmin(id: string = "default"): RiskPolicy {
  const policy = getRiskPolicy(id);

  if (!policy) {
    throw new Error(`RiskPolicy not found: ${id}`);
  }

  // Ensure rules array exists
  if (!Array.isArray(policy.rules)) {
    throw new Error(`RiskPolicy ${id} has invalid rules array`);
  }

  return policy;
}

/* -------------------------------------------------- */
/* List all policies for admin                         */
/* -------------------------------------------------- */

export function listPoliciesForAdmin(): RiskPolicy[] {
  const policies = listRiskPolicies();

  return policies.map((p) => ({
    ...p,
    rules: Array.isArray(p.rules) ? p.rules : [],
  }));
}

/* -------------------------------------------------- */
/* Describe a rule in a UI‑friendly format             */
/* -------------------------------------------------- */

export function describeRule(rule: RiskRule) {
  return {
    id: rule.id,
    label: rule.label,
    weight: rule.weight,
    description: rule.description ?? "",
    condition: rule.condition,
  };
}

/* -------------------------------------------------- */
/* Describe a policy in a UI‑friendly format           */
/* -------------------------------------------------- */

export function describePolicy(policy: RiskPolicy) {
  return {
    id: policy.id,
    label: policy.label,
    description: policy.description ?? "",
    baseScore: policy.baseScore ?? 0,
    maxScore: policy.maxScore ?? 100,
    minScore: policy.minScore ?? 0,
    blockThreshold: policy.blockThreshold ?? null,
    reviewThreshold: policy.reviewThreshold ?? null,
    rules: (policy.rules ?? []).map(describeRule),
  };
}

/* -------------------------------------------------- */
/* Summaries for UI lists                              */
/* -------------------------------------------------- */

export function summarizePolicy(policy: RiskPolicy) {
  return {
    id: policy.id,
    label: policy.label,
    ruleCount: policy.rules?.length ?? 0,
    blockThreshold: policy.blockThreshold ?? null,
    reviewThreshold: policy.reviewThreshold ?? null,
  };
}

export function summarizeRule(rule: RiskRule) {
  return {
    id: rule.id,
    label: rule.label,
    weight: rule.weight,
  };
}

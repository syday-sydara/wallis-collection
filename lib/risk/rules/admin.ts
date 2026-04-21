// lib/risk/admin.ts

import type { RiskPolicy, RiskRule } from "@/lib/risk/types";
import { getRiskPolicy, listRiskPolicies } from "@/lib/risk/rules/policy";

/* -------------------------------------------------- */
/* Fetch a single policy for admin                     */
/* -------------------------------------------------- */

export function getPolicyForAdmin(id: string = "default"): RiskPolicy {
  // getRiskPolicy() already throws if not found
  const policy = getRiskPolicy(id);

  // Ensure rules array is always valid
  return {
    ...policy,
    rules: policy.rules.map((r) => ({ ...r })),
  };
}

/* -------------------------------------------------- */
/* List all policies for admin                         */
/* -------------------------------------------------- */

export function listPoliciesForAdmin(): RiskPolicy[] {
  return listRiskPolicies().map((p) => ({
    ...p,
    rules: p.rules.map((r) => ({ ...r })),
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
    rules: policy.rules.map(describeRule),
  };
}

/* -------------------------------------------------- */
/* Summaries for UI lists                              */
/* -------------------------------------------------- */

export function summarizePolicy(policy: RiskPolicy) {
  return {
    id: policy.id,
    label: policy.label,
    ruleCount: policy.rules.length,
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

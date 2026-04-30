// lib/risk/policy.ts

import type { RiskPolicy, RiskRule } from "@/lib/risk/types";
import { defaultRiskPolicy } from "@/lib/risk/rules/default";

/* -------------------------------------------------- */
/* Internal registry                                   */
/* -------------------------------------------------- */

const policies: Record<string, RiskPolicy> = {
  [defaultRiskPolicy.id]: {
    ...defaultRiskPolicy,
    rules: defaultRiskPolicy.rules.map((r) => ({
      ...r,
      condition: { ...r.condition },
    })),
  },
};

/* -------------------------------------------------- */
/* Safe cloning helpers                                */
/* -------------------------------------------------- */

function cloneRule(rule: RiskRule): RiskRule {
  return {
    ...rule,
    condition: { ...rule.condition },
  };
}

function clonePolicy(policy: RiskPolicy): RiskPolicy {
  return {
    ...policy,
    rules: policy.rules.map(cloneRule),
  };
}

/* -------------------------------------------------- */
/* Get a policy by ID                                  */
/* -------------------------------------------------- */

export function getRiskPolicy(id: string = "default"): RiskPolicy {
  const key = id.toLowerCase();
  const policy = policies[key];

  if (!policy) {
    throw new Error(`RiskPolicy not found: ${id}`);
  }

  return clonePolicy(policy);
}

/* -------------------------------------------------- */
/* List all policies                                   */
/* -------------------------------------------------- */

export function listRiskPolicies(): RiskPolicy[] {
  return Object.values(policies).map(clonePolicy);
}

/* -------------------------------------------------- */
/* Check if a policy exists                            */
/* -------------------------------------------------- */

export function hasRiskPolicy(id: string): boolean {
  return Boolean(policies[id.toLowerCase()]);
}

/* -------------------------------------------------- */
/* Register a new policy                               */
/* -------------------------------------------------- */

export function registerRiskPolicy(policy: RiskPolicy): void {
  if (!policy.id) {
    throw new Error("RiskPolicy must have an ID");
  }

  if (!Array.isArray(policy.rules)) {
    throw new Error(`RiskPolicy ${policy.id} has invalid rules array`);
  }

  const id = policy.id.toLowerCase();

  if (policies[id]) {
    throw new Error(`RiskPolicy already exists: ${policy.id}`);
  }

  policies[id] = clonePolicy(policy);
}

/* -------------------------------------------------- */
/* Admin-friendly descriptions                         */
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

export function summarizePolicies() {
  return listRiskPolicies().map(summarizePolicy);
}

export function summarizeRule(rule: RiskRule) {
  return {
    id: rule.id,
    label: rule.label,
    weight: rule.weight,
  };
}

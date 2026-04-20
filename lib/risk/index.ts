// lib/risk/index.ts

// Core Types
export type {
  RiskContext,
  RiskRule,
  RiskPolicy,
  RiskEvaluationResult,
  RuleCondition,
  NumericOperator,
} from "./types";

// Context Builder
export { buildRiskContext } from "./context";

// Engine
export { evaluatePolicy } from "./engine";

// Rule Evaluator
export { evaluateRule } from "./evaluate";

// Policy Registry
export {
  getRiskPolicy,
  listRiskPolicies,
  registerRiskPolicy,
  hasRiskPolicy,
  describePolicy,
  describeRule,
  summarizePolicy,
  summarizePolicies,
  summarizeRule,
} from "./rules/policy";

// Default Policies
export { defaultRiskPolicy } from "./rules/default";

// Service Wrapper
export { evaluateRisk } from "./rules/service";

// Admin Helpers
export {
  getPolicyForAdmin,
  listPoliciesForAdmin,
} from "./rules/admin";

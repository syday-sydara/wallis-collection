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
export * as RiskPolicies from "./rules/policy";
export { defaultRiskPolicy } from "./rules/default";

// Service Wrapper
export { evaluateRisk, evaluateRisk as evaluate } from "./rules/service";

// Admin Helpers
export * as RiskAdmin from "./rules/admin";

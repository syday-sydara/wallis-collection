// lib/risk/types.ts

/* -------------------------------------------------- */
/* Numeric Operators                                   */
/* -------------------------------------------------- */

export type NumericOperator =
  | ">"
  | ">="
  | "<"
  | "<="
  | "=="
  | "!=";

/* -------------------------------------------------- */
/* Risk Context (all signals available to the engine)  */
/* -------------------------------------------------- */

export interface RiskContext {
  // Identity
  userId?: string | null;
  email?: string | null;
  emailDomain?: string | null;
  phone?: string | null;
  phonePrefix?: string | null;

  // IP / Geo
  ip?: string | null;
  country?: string | null;
  region?: string | null;
  city?: string | null;
  isPrivateIp?: boolean;
  distanceFromLastIpKm?: number | null;

  // Device Intelligence
  deviceId?: string | null;
  deviceReputation?: number; // 0–100
  deviceConfidence?: number; // 0–100
  isMobile?: boolean;
  isBot?: boolean;

  // Behavior Intelligence
  sessionVelocity?: number; // actions/min
  permissionDenials?: number;
  failedLogins?: number;
  ipVelocity?: number; // requests/min
  routeVelocity?: number; // requests/min for specific route

  // Transaction / Order
  amount?: number | null;
  currency?: string | null;
  previousOrderAmount?: number | null;
  orderVelocity?: number | null;

  // Risk Engine
  riskScore?: number; // existing score
  triggeredRules?: string[];

  // User Agent
  userAgent?: string | null;
}

/* -------------------------------------------------- */
/* Utility: Extract only string fields                 */
/* -------------------------------------------------- */

export type StringFields<T> = {
  [K in keyof T]: T[K] extends string | null | undefined ? K : never;
}[keyof T];

/* -------------------------------------------------- */
/* RuleCondition (v3 DSL)                              */
/* -------------------------------------------------- */

export type RuleCondition =
  // IP rules
  | { type: "ip_in_list"; list: string[]; not?: boolean }
  | { type: "country_in_list"; list: string[]; not?: boolean }
  | { type: "region_in_list"; list: string[]; not?: boolean }

  // Email / phone mismatch
  | { type: "email_phone_mismatch"; not?: boolean }

  // Numeric threshold rules
  | {
      type: "numeric_threshold";
      metric: keyof RiskContext;
      operator: NumericOperator;
      value: number;
      not?: boolean;
    }

  // Risk score rules
  | { type: "risk_score_above"; value: number; not?: boolean }
  | { type: "risk_score_below"; value: number; not?: boolean }

  // Device rules
  | { type: "is_mobile"; not?: boolean }
  | { type: "is_bot"; not?: boolean }
  | { type: "is_private_ip"; not?: boolean }
  | { type: "device_reputation_below"; value: number; not?: boolean }
  | { type: "device_confidence_below"; value: number; not?: boolean }

  // Behavior rules
  | { type: "velocity_above"; metric: keyof RiskContext; value: number; not?: boolean }
  | { type: "failed_logins_above"; value: number; not?: boolean }
  | { type: "permission_denials_above"; value: number; not?: boolean }

  // Geo rules
  | { type: "distance_from_last_ip_above"; value: number; not?: boolean }

  // User agent rules
  | { type: "min_user_agent_length"; value: number; not?: boolean }

  // String rules (restricted to string fields)
  | {
      type: "string_contains";
      field: StringFields<RiskContext>;
      value: string;
      not?: boolean;
    }
  | {
      type: "string_matches";
      field: StringFields<RiskContext>;
      regex: string;
      not?: boolean;
    }

  // List membership rules
  | { type: "state_in_list"; list: string[]; not?: boolean }
  | { type: "email_domain_in_list"; list: string[]; not?: boolean }
  | { type: "phone_prefix_in_list"; list: string[]; length?: number; not?: boolean }

  // Compound rules
  | { type: "and"; conditions: [RuleCondition, ...RuleCondition[]]; not?: boolean }
  | { type: "or"; conditions: [RuleCondition, ...RuleCondition[]]; not?: boolean };

/* -------------------------------------------------- */
/* Risk Rule (named rule with weight)                  */
/* -------------------------------------------------- */

export interface RiskRule {
  id: string; // unique rule ID
  label: string; // human-readable name
  description?: string;
  weight: number; // how much this rule contributes to score
  condition: RuleCondition;
}

/* -------------------------------------------------- */
/* Risk Policy (group of rules + scoring model)        */
/* -------------------------------------------------- */

export interface RiskPolicy {
  id: string;
  label: string;
  description?: string;

  // Rules included in this policy
  rules: RiskRule[];

  // Scoring model
  baseScore?: number; // default 0
  maxScore?: number; // default 100
  minScore?: number; // default 0

  // Optional: auto-block threshold
  blockThreshold?: number;

  // Optional: auto-review threshold
  reviewThreshold?: number;
}

/* -------------------------------------------------- */
/* Evaluation Result                                   */
/* -------------------------------------------------- */

export interface RiskEvaluationResult {
  score: number;
  triggeredRules: string[];
  block: boolean;
  review: boolean;
  details: {
    ruleId: string;
    weight: number;
    passed: boolean;
  }[];
}

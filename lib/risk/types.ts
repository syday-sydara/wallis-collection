// lib/risk/types.ts

// Extract only string fields from RiskContext
type StringFields<T> = {
  [K in keyof T]: T[K] extends string ? K : never
}[keyof T];

export type RuleCondition =
  // IP rules
  | { type: "ip_in_list"; list: string[]; not?: boolean }

  // Email/phone mismatch
  | { type: "email_phone_mismatch"; not?: boolean }

  // Numeric threshold rules
  | {
      type: "numeric_threshold";
      metric: keyof RiskContext;
      operator: NumericOperator;
      value: number;
      not?: boolean;
    }

  // User agent rules
  | { type: "min_user_agent_length"; value: number; not?: boolean }

  // List membership rules
  | { type: "state_in_list"; list: string[]; not?: boolean }
  | { type: "email_domain_in_list"; list: string[]; not?: boolean }
  | { type: "phone_prefix_in_list"; list: string[]; length?: number; not?: boolean }

  // Compound rules (must have at least 1 condition)
  | { type: "and"; conditions: [RuleCondition, ...RuleCondition[]]; not?: boolean }
  | { type: "or"; conditions: [RuleCondition, ...RuleCondition[]]; not?: boolean }

  // Device rules
  | { type: "is_mobile"; not?: boolean }
  | { type: "is_bot"; not?: boolean }
  | { type: "is_private_ip"; not?: boolean }

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
      regex: string; // compiled safely in evaluator
      not?: boolean;
    };
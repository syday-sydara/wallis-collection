// lib/risk/types.ts
export type RuleCondition =
  // Existing rules
  | { type: "ip_in_list"; list: string[]; not?: boolean }
  | { type: "email_phone_mismatch"; not?: boolean }
  | { type: "numeric_threshold"; metric: keyof RiskContext; operator: NumericOperator; value: number; not?: boolean }
  | { type: "min_user_agent_length"; value: number; not?: boolean }
  | { type: "state_in_list"; list: string[]; not?: boolean }
  | { type: "email_domain_in_list"; list: string[]; not?: boolean }
  | { type: "phone_prefix_in_list"; list: string[]; length?: number; not?: boolean }

  // New: compound rules
  | { type: "and"; conditions: RuleCondition[]; not?: boolean }
  | { type: "or"; conditions: RuleCondition[]; not?: boolean }

  // New: device rules (if added to RiskContext)
  | { type: "is_mobile"; not?: boolean }
  | { type: "is_bot"; not?: boolean }
  | { type: "is_private_ip"; not?: boolean }

  // New: string rules
  | { type: "string_contains"; field: keyof RiskContext; value: string; not?: boolean }
  | { type: "string_matches"; field: keyof RiskContext; regex: string; not?: boolean };
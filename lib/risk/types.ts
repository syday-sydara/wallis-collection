// lib/risk/types.ts

export type RiskContext = {
  ip: string;
  email: string;
  emailDomain: string;
  phone: string;
  phoneRegion: string;
  userAgent: string;
  attempts: number;
  cartValue: number;
  shippingState: string;
};

export type NumericOperator = ">" | "<" | ">=" | "<=";

export type RuleCondition =
  | {
      type: "ip_in_list";
      list: string[];
    }
  | {
      type: "email_phone_mismatch";
    }
  | {
      type: "numeric_threshold";
      metric: keyof RiskContext;
      operator: NumericOperator;
      value: number;
    }
  | {
      type: "min_user_agent_length";
      value: number;
    }
  | {
      type: "state_in_list";
      list: string[];
    }
  | {
      type: "email_domain_in_list";
      list: string[];
    }
  | {
      type: "phone_prefix_in_list";
      list: string[];
      length?: number;
    };

export type FraudRuleRecord = {
  id: string;
  name: string;
  description?: string | null;
  weight: number;
  enabled: boolean;
  condition: RuleCondition;
};

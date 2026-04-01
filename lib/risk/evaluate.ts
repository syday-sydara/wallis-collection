// lib/risk/evaluate.ts

import type { RuleCondition, RiskContext } from "./types";
import { logEvent } from "@/lib/logger";

export function evaluateRule(condition: RuleCondition, context: RiskContext): boolean {
  const c = condition;

  // Optional NOT operator
  if ("not" in c && c.not) {
    const clone = { ...c };
    delete clone.not;
    return !evaluateRule(clone as RuleCondition, context);
  }

  switch (c.type) {
    case "ip_in_list":
      return c.list.includes(context.ip);

    case "email_phone_mismatch":
      return context.emailDomain !== context.phoneRegion;

    case "numeric_threshold": {
      const metricValue = context[c.metric];

      if (typeof metricValue !== "number") return false;

      switch (c.operator) {
        case ">": return metricValue > c.value;
        case "<": return metricValue < c.value;
        case ">=": return metricValue >= c.value;
        case "<=": return metricValue <= c.value;
        default: return false;
      }
    }

    case "min_user_agent_length":
      return context.userAgent.length < c.value;

    case "state_in_list":
      return c.list.includes(context.shippingState);

    case "email_domain_in_list":
      return c.list.includes(context.emailDomain);

    case "phone_prefix_in_list": {
      const len = c.length ?? 4;
      const prefix = context.phone.slice(0, len);
      return c.list.includes(prefix);
    }

    // Compound rules
    case "and":
      return c.conditions.every(cond => evaluateRule(cond, context));

    case "or":
      return c.conditions.some(cond => evaluateRule(cond, context));

    default:
      logEvent("risk_unknown_rule_type", { type: c.type });
      return false;
  }
}
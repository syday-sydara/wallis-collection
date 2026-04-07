// lib/risk/evaluate.ts
import type { RuleCondition, RiskContext } from "./types";
import { logEvent } from "@/lib/auth/logger";

const MAX_DEPTH = 10;

export function evaluateRule(
  condition: RuleCondition,
  context: RiskContext,
  depth = 0
): boolean {
  if (depth > MAX_DEPTH) {
    logEvent("risk_rule_recursion_limit", { condition });
    return false;
  }

  const c = condition;

  // NOT operator
  if ("not" in c && c.not) {
    const clone = { ...c };
    delete clone.not;
    return !evaluateRule(clone as RuleCondition, context, depth + 1);
  }

  switch (c.type) {
    case "ip_in_list":
      return c.list.includes(context.ip);

    case "email_phone_mismatch":
      return context.emailDomain !== context.phoneRegion;

    case "numeric_threshold": {
      const metricValue = context[c.metric];

      if (typeof metricValue !== "number") {
        logEvent("risk_invalid_metric", {
          metric: c.metric,
          value: metricValue
        });
        return false;
      }

      switch (c.operator) {
        case ">": return metricValue > c.value;
        case "<": return metricValue < c.value;
        case ">=": return metricValue >= c.value;
        case "<=": return metricValue <= c.value;
        default:
          logEvent("risk_invalid_operator", { operator: c.operator });
          return false;
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

    case "and":
      return c.conditions.every(cond =>
        evaluateRule(cond, context, depth + 1)
      );

    case "or":
      return c.conditions.some(cond =>
        evaluateRule(cond, context, depth + 1)
      );

    default:
      logEvent("risk_unknown_rule_type", { type: c.type });
      return false;
  }
}
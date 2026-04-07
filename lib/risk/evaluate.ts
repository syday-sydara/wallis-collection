// lib/risk/evaluate.ts

import type { RuleCondition, RiskContext } from "./types";
import { emitSecurityEvent } from "@/lib/events/emitter";

const MAX_DEPTH = 10;

/* -------------------------------------------------- */
/* Safe regex compiler                                 */
/* -------------------------------------------------- */
function safeRegex(pattern: string): RegExp | null {
  try {
    return new RegExp(pattern, "i");
  } catch {
    return null;
  }
}

/* -------------------------------------------------- */
/* Main evaluator                                      */
/* -------------------------------------------------- */
export function evaluateRule(
  condition: RuleCondition,
  context: RiskContext,
  depth = 0
): boolean {
  if (depth > MAX_DEPTH) {
    emitSecurityEvent({
      type: "SYSTEM_ANOMALY",
      message: "Risk rule recursion limit exceeded",
      severity: "medium",
      category: "risk",
      metadata: { condition },
    });
    return false;
  }

  const c = condition;

  /* -------------------------------------------------- */
  /* NOT operator                                        */
  /* -------------------------------------------------- */
  if ("not" in c && c.not) {
    const clone = { ...c };
    delete clone.not;
    return !evaluateRule(clone as RuleCondition, context, depth + 1);
  }

  /* -------------------------------------------------- */
  /* Rule handlers                                       */
  /* -------------------------------------------------- */
  switch (c.type) {
    /* ---------------- IP / GEO ---------------- */
    case "ip_in_list":
      return c.list.includes(context.ip ?? "");

    case "country_in_list":
      return c.list.includes((context.country ?? "").toLowerCase());

    case "region_in_list":
      return c.list.includes((context.region ?? "").toLowerCase());

    /* ---------------- Identity mismatch ---------------- */
    case "email_phone_mismatch":
      return context.emailDomain !== context.phonePrefix;

    /* ---------------- Numeric threshold ---------------- */
    case "numeric_threshold": {
      const value = context[c.metric];

      if (typeof value !== "number") {
        emitSecurityEvent({
          type: "SYSTEM_ANOMALY",
          message: "Invalid numeric metric in rule",
          severity: "medium",
          category: "risk",
          metadata: { metric: c.metric, value },
        });
        return false;
      }

      switch (c.operator) {
        case ">": return value > c.value;
        case ">=": return value >= c.value;
        case "<": return value < c.value;
        case "<=": return value <= c.value;
        case "==": return value === c.value;
        case "!=": return value !== c.value;
        default:
          emitSecurityEvent({
            type: "SYSTEM_ANOMALY",
            message: "Invalid numeric operator",
            severity: "medium",
            category: "risk",
            metadata: { operator: c.operator },
          });
          return false;
      }
    }

    /* ---------------- Risk score rules ---------------- */
    case "risk_score_above":
      return (context.riskScore ?? 0) > c.value;

    case "risk_score_below":
      return (context.riskScore ?? 0) < c.value;

    /* ---------------- Device rules ---------------- */
    case "is_mobile":
      return context.isMobile === true;

    case "is_bot":
      return context.isBot === true;

    case "is_private_ip":
      return context.isPrivateIp === true;

    case "device_reputation_below":
      return (context.deviceReputation ?? 100) < c.value;

    case "device_confidence_below":
      return (context.deviceConfidence ?? 100) < c.value;

    /* ---------------- Behavior rules ---------------- */
    case "velocity_above": {
      const value = context[c.metric];
      return typeof value === "number" && value > c.value;
    }

    case "failed_logins_above":
      return (context.failedLogins ?? 0) > c.value;

    case "permission_denials_above":
      return (context.permissionDenials ?? 0) > c.value;

    /* ---------------- Geo distance ---------------- */
    case "distance_from_last_ip_above":
      return (context.distanceFromLastIpKm ?? 0) > c.value;

    /* ---------------- User agent rules ---------------- */
    case "min_user_agent_length":
      return (context.userAgent ?? "").length < c.value;

    /* ---------------- String rules ---------------- */
    case "string_contains": {
      const fieldValue = context[c.field] ?? "";
      return typeof fieldValue === "string" && fieldValue.includes(c.value);
    }

    case "string_matches": {
      const fieldValue = context[c.field] ?? "";
      const regex = safeRegex(c.regex);
      return regex ? regex.test(fieldValue) : false;
    }

    /* ---------------- List membership ---------------- */
    case "state_in_list":
      return c.list.includes((context.region ?? "").toLowerCase());

    case "email_domain_in_list":
      return c.list.includes(context.emailDomain ?? "");

    case "phone_prefix_in_list": {
      const len = c.length ?? 4;
      const prefix = (context.phone ?? "").slice(0, len);
      return c.list.includes(prefix);
    }

    /* ---------------- Compound rules ---------------- */
    case "and":
      return c.conditions.every((cond) =>
        evaluateRule(cond, context, depth + 1)
      );

    case "or":
      return c.conditions.some((cond) =>
        evaluateRule(cond, context, depth + 1)
      );

    /* ---------------- Unknown rule ---------------- */
    default:
      emitSecurityEvent({
        type: "SYSTEM_ANOMALY",
        message: "Unknown risk rule type",
        severity: "medium",
        category: "risk",
        metadata: { type: (c as any).type },
      });
      return false;
  }
}

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
/* Numeric extractor (tiny helper, no over-engineering)*/
/* -------------------------------------------------- */
function getNumber(context: RiskContext, key: keyof RiskContext): number | null {
  const v = context[key];
  return typeof v === "number" ? v : null;
}

/* -------------------------------------------------- */
/* Normalize list to lowercase                         */
/* -------------------------------------------------- */
function normalizeList(list: string[]): string[] {
  return list.map((x) => x.toLowerCase());
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
      actorType: "system",
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
      return normalizeList(c.list).includes((context.ip ?? "").toLowerCase());

    case "country_in_list":
      return normalizeList(c.list).includes((context.country ?? "").toLowerCase());

    case "region_in_list":
      return normalizeList(c.list).includes((context.region ?? "").toLowerCase());

    /* ---------------- Identity mismatch ---------------- */
    case "email_phone_mismatch": {
      const emailDomain = context.emailDomain ?? "";
      const phonePrefix = context.phonePrefix ?? "";
      return Boolean(emailDomain && phonePrefix) && !emailDomain.startsWith(phonePrefix);
    }

    /* ---------------- Numeric threshold ---------------- */
    case "numeric_threshold": {
      const raw = getNumber(context, c.metric);
      if (raw === null) {
        emitSecurityEvent({
          type: "SYSTEM_ANOMALY",
          message: "Invalid numeric metric in rule",
          severity: "medium",
          category: "risk",
          actorType: "system",
          metadata: { metric: c.metric, value: context[c.metric] },
        });
        return false;
      }

      switch (c.operator) {
        case ">": return raw > c.value;
        case ">=": return raw >= c.value;
        case "<": return raw < c.value;
        case "<=": return raw <= c.value;
        case "==": return raw === c.value;
        case "!=": return raw !== c.value;
        default:
          emitSecurityEvent({
            type: "SYSTEM_ANOMALY",
            message: "Invalid numeric operator",
            severity: "medium",
            category: "risk",
            actorType: "system",
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
      const raw = getNumber(context, c.metric);
      return raw !== null && raw > c.value;
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
      return (context.userAgent ?? "").length >= c.value;

    /* ---------------- String rules ---------------- */
    case "string_contains": {
      if (!c.field) return false;
      const raw = context[c.field as keyof RiskContext] ?? "";
      return typeof raw === "string" && raw.includes(c.value);
    }

    case "string_matches": {
      if (!c.field) return false;
      const raw = context[c.field as keyof RiskContext] ?? "";
      const regex = safeRegex(c.regex);

      if (!regex) {
        emitSecurityEvent({
          type: "SYSTEM_ANOMALY",
          message: "Invalid regex in risk rule",
          severity: "medium",
          category: "risk",
          actorType: "system",
          metadata: { regex: c.regex },
        });
        return false;
      }

      return typeof raw === "string" && regex.test(raw);
    }

    /* ---------------- List membership ---------------- */
    case "state_in_list":
      return normalizeList(c.list).includes((context.region ?? "").toLowerCase());

    case "email_domain_in_list":
      return normalizeList(c.list).includes((context.emailDomain ?? "").toLowerCase());

    case "phone_prefix_in_list": {
      const len = c.length ?? 4;
      const prefix =
        context.phonePrefix ??
        (context.phone ?? "").slice(0, len);

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
        actorType: "system",
        metadata: { type: (c as any).type },
      });
      return false;
  }
}

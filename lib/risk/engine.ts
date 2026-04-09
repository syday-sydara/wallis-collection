// lib/risk/engine.ts

import { prisma } from "@/lib/db";
import type {
  RiskContext,
  RiskRule,
  RiskPolicy,
  RiskEvaluationResult,
} from "./types";
import { evaluateRule } from "./evaluate";
import { emitSecurityEvent, emitAlertEvent } from "@/lib/events/emitter";
import { logAuditEvent } from "@/lib/audit/log";

/* -------------------------------------------------- */
/* Classification                                       */
/* -------------------------------------------------- */

function classify(score: number, policy: RiskPolicy) {
  if (policy.blockThreshold && score >= policy.blockThreshold) return "HIGH";
  if (policy.reviewThreshold && score >= policy.reviewThreshold) return "MEDIUM";
  return "LOW";
}

/* -------------------------------------------------- */
/* Main Engine                                          */
/* -------------------------------------------------- */

export async function evaluatePolicy(
  context: RiskContext,
  policyId: string
): Promise<RiskEvaluationResult> {
  /* -------------------------------------------------- */
  /* Load policy + rules                                 */
  /* -------------------------------------------------- */
  const policy = (await prisma.riskPolicy.findUnique({
    where: { id: policyId },
    include: { rules: true },
  })) as unknown as RiskPolicy;

  if (!policy) {
    throw new Error(`RiskPolicy not found: ${policyId}`);
  }

  const baseScore = policy.baseScore ?? 0;
  const maxScore = policy.maxScore ?? 100;

  let score = baseScore;
  const triggeredRules: string[] = [];
  const details: RiskEvaluationResult["details"] = [];

  /* -------------------------------------------------- */
  /* Evaluate rules                                      */
  /* -------------------------------------------------- */
  for (const rule of policy.rules as RiskRule[]) {
    let passed = false;

    try {
      passed = evaluateRule(rule.condition, context);
    } catch (err: any) {
      await emitSecurityEvent({
        type: "SYSTEM_ANOMALY",
        message: `Risk rule evaluation error: ${rule.id}`,
        severity: "medium",
        metadata: { error: err?.message, ruleId: rule.id },
        category: "risk",
        source: "risk-engine",
      });

      await logAuditEvent({
        action: "RISK_RULE_EVALUATION_ERROR",
        actorType: "SYSTEM",
        resource: "riskRule",
        resourceId: rule.id,
        metadata: { error: err?.message },
      });
    }

    if (passed) {
      score += rule.weight;
      triggeredRules.push(rule.id);

      await logAuditEvent({
        action: "RISK_RULE_TRIGGERED",
        actorType: "SYSTEM",
        resource: "riskRule",
        resourceId: rule.id,
        metadata: { ruleName: rule.label },
      });
    }

    details.push({
      ruleId: rule.id,
      weight: rule.weight,
      passed,
    });
  }

  /* -------------------------------------------------- */
  /* Cap score                                           */
  /* -------------------------------------------------- */
  score = Math.min(score, maxScore);

  /* -------------------------------------------------- */
  /* Classification                                      */
  /* -------------------------------------------------- */
  const level = classify(score, policy);

  /* -------------------------------------------------- */
  /* Audit logging                                       */
  /* -------------------------------------------------- */
  await logAuditEvent({
    action: "RISK_SCORE_COMPUTED",
    actorType: "SYSTEM",
    metadata: {
      score,
      level,
      triggeredRules,
      ip: context.ip,
      email: context.email,
    },
  });

  /* -------------------------------------------------- */
  /* Alerting                                            */
  /* -------------------------------------------------- */
  if (level === "HIGH") {
    await emitAlertEvent({
      event: "ALERT_RISK_SCORE_HIGH",
      metadata: {
        score,
        triggeredRules,
        email: context.email,
        ip: context.ip,
      },
    });
  }

  /* -------------------------------------------------- */
  /* Return result                                       */
  /* -------------------------------------------------- */
  return {
    score,
    triggeredRules,
    block: level === "HIGH",
    review: level === "MEDIUM",
    details,
  };
}

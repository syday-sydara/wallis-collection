// lib/risk/engine.ts
import { prisma } from "@/lib/db";
import type { RiskContext, FraudRuleRecord } from "./types";
import { evaluateRule } from "./evaluate";
import { logAuditEvent } from "@/lib/audit/log";
import { processAlert } from "@/lib/audit/alerts";

export type RiskResult = {
  score: number;
  level: "LOW" | "MEDIUM" | "HIGH";
  triggered: FraudRuleRecord[];
};

function classify(score: number) {
  if (score >= 50) return "HIGH";
  if (score >= 20) return "MEDIUM";
  return "LOW";
}

export async function calculateRiskScore(context: RiskContext): Promise<RiskResult> {
  const rules = (await prisma.fraudRule.findMany({
    where: { enabled: true }
  })) as unknown as FraudRuleRecord[];

  let score = 0;
  const triggered: FraudRuleRecord[] = [];

  // Evaluate rules in parallel
  const evaluations = await Promise.all(
    rules.map(async (rule) => {
      try {
        const matched = evaluateRule(rule.condition, context);

        if (matched) {
          return { rule, matched: true };
        }
      } catch (err: any) {
        await logAuditEvent({
          action: "RISK_RULE_EVALUATION_ERROR",
          actorType: "SYSTEM",
          resource: "fraudRule",
          resourceId: rule.id,
          metadata: { message: err?.message }
        });
      }

      return { rule, matched: false };
    })
  );

  // Aggregate results
  for (const { rule, matched } of evaluations) {
    if (matched) {
      score += rule.weight;
      triggered.push(rule);

      await logAuditEvent({
        action: "RISK_RULE_TRIGGERED",
        actorType: "SYSTEM",
        resource: "fraudRule",
        resourceId: rule.id,
        metadata: { ruleName: rule.name }
      });
    }
  }

  // Soft cap to prevent runaway scores
  score = Math.min(score, 100);

  const level = classify(score);

  await logAuditEvent({
    action: "RISK_SCORE_COMPUTED",
    actorType: "SYSTEM",
    metadata: {
      score,
      level,
      triggeredRules: triggered.map((r) => r.name),
      ip: context.ip,
      email: context.email
    }
  });

  // Fire-and-forget alerting
  if (level === "HIGH") {
    processAlert({
      action: "ALERT_RISK_SCORE_HIGH",
      metadata: {
        score,
        email: context.email,
        ip: context.ip,
        triggeredRules: triggered.map((r) => r.name)
      }
    }).catch((err) => {
      console.error("Failed to send risk alert:", err);
    });
  }

  return { score, level, triggered };
}
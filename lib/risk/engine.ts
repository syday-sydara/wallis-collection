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

  for (const rule of rules) {
    try {
      const matched = evaluateRule(rule.condition, context);

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
    } catch (err: any) {
      await logAuditEvent({
        action: "RISK_RULE_EVALUATION_ERROR",
        actorType: "SYSTEM",
        resource: "fraudRule",
        resourceId: rule.id,
        metadata: { message: err?.message }
      });
    }
  }

  const level = classify(score);

  await logAuditEvent({
    action: "RISK_SCORE_COMPUTED",
    actorType: "SYSTEM",
    metadata: {
      score,
      level,
      triggeredRules: triggered.map(r => r.name),
      ip: context.ip,
      email: context.email
    }
  });

  if (level === "HIGH") {
    await processAlert({
      action: "ALERT_RISK_SCORE_HIGH",
      metadata: {
        score,
        email: context.email,
        ip: context.ip,
        triggeredRules: triggered.map(r => r.name)
      }
    });
  }

  return { score, level, triggered };
}
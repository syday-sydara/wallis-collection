// lib/risk/engine.ts

import { prisma } from "@/lib/db";
import type { RiskContext, FraudRuleRecord } from "./types";
import { evaluateRule } from "./evaluate";
import { logEvent } from "@/lib/logger";

export type RiskResult = {
  score: number;
  triggered: FraudRuleRecord[];
};

export async function calculateRiskScore(context: RiskContext): Promise<RiskResult> {
  // Load all enabled rules from DB
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
      }
    } catch (err: any) {
      logEvent(
        "risk_rule_evaluation_error",
        {
          ruleId: rule.id,
          name: rule.name,
          message: err?.message
        },
        "error"
      );
    }
  }

  logEvent("risk_score_computed", {
    ip: context.ip,
    email: context.email,
    score,
    triggeredRules: triggered.map((r) => r.name)
  });

  return { score, triggered };
}

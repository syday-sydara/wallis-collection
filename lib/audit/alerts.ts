// lib/audit/alerts.ts
import { prisma } from "@/lib/db";

export async function processAlert(event: AuditEvent) {
  try {
    // 1. Load matching rules
    const rules = await prisma.alertRule.findMany({
      where: {
        event: event.action,
        enabled: true
      }
    });

    if (rules.length === 0) {
      return; // nothing to do
    }

    // 2. Evaluate each rule
    for (const rule of rules) {
      let shouldTrigger = false;

      try {
        shouldTrigger = await evaluateRule(rule, event);
      } catch (err) {
        console.error("Failed to evaluate alert rule:", {
          ruleId: rule.id,
          error: err
        });
        continue; // skip this rule but continue processing others
      }

      // 3. Trigger alert
      if (shouldTrigger) {
        try {
          await sendAlert(rule, event);
        } catch (err) {
          console.error("Failed to send alert:", {
            ruleId: rule.id,
            error: err
          });
        }
      }
    }
  } catch (err) {
    // Top‑level catch: never break the audit pipeline
    console.error("Alert processing failed:", err);
  }
}

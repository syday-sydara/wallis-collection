// lib/audit/alerts.ts
import { prisma } from "@/lib/db";

export async function processAlert(event: AuditEvent) {
  // 1. Load matching rules
  const rules = await prisma.alertRule.findMany({
    where: { event: event.action, enabled: true }
  });

  for (const rule of rules) {
    const shouldTrigger = await evaluateRule(rule, event);

    if (shouldTrigger) {
      await sendAlert(rule, event);
    }
  }
}
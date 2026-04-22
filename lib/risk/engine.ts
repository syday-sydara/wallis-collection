// lib/risk/engine.ts

import { prisma } from "@/lib/prisma";
import { redis, redisKey, redisSafe } from "@/lib/redis";
import type {
  RiskContext,
  RiskRule,
  RiskPolicy,
  RiskEvaluationResult,
} from "./types";
import { evaluateRule } from "./evaluate";
import { emitEvent } from "@/lib/events/emitter";
import { logAuditEvent } from "@/lib/audit/log";

/* -------------------------------------------------- */
/* Event wrappers                                      */
/* -------------------------------------------------- */

function emitSecurityEvent(data: any) {
  emitEvent({
    kind: "security",
    severity: data.severity ?? "medium",
    category: "risk",
    source: "risk-engine",
    ...data,
  });
}

function emitAlertEvent(data: any) {
  emitEvent({
    kind: "alert",
    event: data.event,
    severity: "high",
    category: "risk",
    source: "risk-engine",
    metadata: data.metadata ?? {},
  });
}

/* -------------------------------------------------- */
/* Caching                                             */
/* -------------------------------------------------- */

const POLICY_CACHE_TTL = 3600; // 1 hour

async function getCachedPolicy(policyId: string): Promise<RiskPolicy | null> {
  const cacheKey = redisKey("risk", "policy", policyId);

  // Try cache first
  const cached = await redisSafe(
    () => redis.get(cacheKey),
    null
  );

  if (cached) {
    return JSON.parse(cached);
  }

  // Load from database
  const dbPolicy = await prisma.riskPolicy.findUnique({
    where: { id: policyId },
    include: { rules: true },
  });

  if (!dbPolicy) {
    return null;
  }

  // Convert Prisma → RiskPolicy
  const policy: RiskPolicy = {
    id: dbPolicy.id,
    label: dbPolicy.label,
    description: dbPolicy.description ?? undefined,
    rules: dbPolicy.rules as unknown as RiskRule[],
    baseScore: dbPolicy.baseScore ?? 0,
    maxScore: dbPolicy.maxScore ?? 100,
    minScore: dbPolicy.minScore ?? 0,
    blockThreshold: dbPolicy.blockThreshold ?? undefined,
    reviewThreshold: dbPolicy.reviewThreshold ?? undefined,
  };

  // Cache for 1 hour
  await redisSafe(
    () => redis.set(cacheKey, JSON.stringify(policy), { ex: POLICY_CACHE_TTL }),
    null
  );

  return policy;
}

/* -------------------------------------------------- */
/* Cache Invalidation                                  */
/* -------------------------------------------------- */

export async function invalidatePolicyCache(policyId: string): Promise<void> {
  const cacheKey = redisKey("risk", "policy", policyId);
  await redisSafe(() => redis.del(cacheKey), null);
}

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
  /* Load policy + rules (with caching)                  */
  /* -------------------------------------------------- */

  const policy = await getCachedPolicy(policyId);

  if (!policy) {
    throw new Error(`RiskPolicy not found: ${policyId}`);
  }

  /* -------------------------------------------------- */
  /* Validate policy                                     */
  /* -------------------------------------------------- */

  if (!Array.isArray(policy.rules)) {
    throw new Error(`RiskPolicy ${policyId} has invalid rules array`);
  }

  const baseScore = policy.baseScore ?? 0;
  const maxScore = policy.maxScore ?? 100;

  let score = baseScore;
  const triggeredRules: string[] = [];
  const details: RiskEvaluationResult["details"] = [];

  /* -------------------------------------------------- */
  /* Evaluate rules                                      */
  /* -------------------------------------------------- */

  for (const rule of policy.rules) {
    let passed = false;

    try {
      passed = evaluateRule(rule.condition, context);
    } catch (err: any) {
      // Log anomaly
      emitSecurityEvent({
        type: "SYSTEM_ANOMALY",
        message: `Risk rule evaluation error: ${rule.id}`,
        severity: "medium",
        metadata: { error: err?.message, ruleId: rule.id },
      });

      await logAuditEvent({
        action: "RISK_RULE_EVALUATION_ERROR",
        actorType: "SYSTEM",
        resource: "riskRule",
        resourceId: rule.id,
        metadata: { error: err?.message },
      });

      passed = false;
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
      userId: context.userId,
    },
  });

  /* -------------------------------------------------- */
  /* Alerting                                            */
  /* -------------------------------------------------- */

  if (level === "HIGH") {
    emitAlertEvent({
      event: "ALERT_RISK_SCORE_HIGH",
      metadata: {
        score,
        triggeredRules,
        email: context.email,
        ip: context.ip,
        userId: context.userId,
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

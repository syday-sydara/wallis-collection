// lib/risk/rules/service.ts

import { buildRiskContext } from "@/lib/risk/context";
import { evaluatePolicy } from "@/lib/risk/engine";
import { getRiskPolicy } from "@/lib/risk/rules/policy";
import { emitEvent } from "@/lib/events/emitter";
import { logAuditEvent } from "@/lib/audit/log";
import type { RiskEvaluationResult } from "@/lib/risk/types";

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
/* Main Service                                        */
/* -------------------------------------------------- */

export async function evaluateRisk(args: {
  policyId: string;

  // Identity
  userId?: string | null;
  email?: string | null;
  phone?: string | null;

  // Request
  ip?: string | null;
  userAgent?: string | null;

  // Behavior
  sessionVelocity?: number;
  permissionDenials?: number;
  failedLogins?: number;
  ipVelocity?: number;
  routeVelocity?: number;

  // Transaction
  amount?: number;
  previousOrderAmount?: number;
  orderVelocity?: number;

  // Geo
  country?: string | null;
  region?: string | null;
  city?: string | null;
  distanceFromLastIpKm?: number;

  // Device
  deviceId?: string | null;
  deviceReputation?: number;
  deviceConfidence?: number;
}): Promise<RiskEvaluationResult> {
  /* -------------------------------------------------- */
  /* Validate policy exists                              */
  /* -------------------------------------------------- */

  const policy = getRiskPolicy(args.policyId);
  if (!policy) {
    emitSecurityEvent({
      type: "SYSTEM_ANOMALY",
      message: `Risk policy not found: ${args.policyId}`,
      severity: "high",
      metadata: { policyId: args.policyId },
    });

    throw new Error(`Risk policy not found: ${args.policyId}`);
  }

  /* -------------------------------------------------- */
  /* Build context                                       */
  /* -------------------------------------------------- */

  const context = buildRiskContext({
    ip: args.ip ?? null,
    email: args.email ?? null,
    phone: args.phone ?? null,
    userAgent: args.userAgent ?? null,

    userId: args.userId ?? null,

    sessionVelocity: args.sessionVelocity,
    permissionDenials: args.permissionDenials,
    failedLogins: args.failedLogins,
    ipVelocity: args.ipVelocity,
    routeVelocity: args.routeVelocity,

    amount: args.amount,
    previousOrderAmount: args.previousOrderAmount,
    orderVelocity: args.orderVelocity,

    country: args.country,
    region: args.region,
    city: args.city,
    distanceFromLastIpKm: args.distanceFromLastIpKm,

    deviceId: args.deviceId,
    deviceReputation: args.deviceReputation,
    deviceConfidence: args.deviceConfidence,
  });

  /* -------------------------------------------------- */
  /* Evaluate policy                                     */
  /* -------------------------------------------------- */

  const result = await evaluatePolicy(context, args.policyId);

  /* -------------------------------------------------- */
  /* Emit audit event                                    */
  /* -------------------------------------------------- */

  await logAuditEvent({
    action: "RISK_EVALUATED",
    actorType: "SYSTEM",
    resource: "riskPolicy",
    resourceId: args.policyId,
    metadata: {
      score: result.score,
      block: result.block,
      review: result.review,
      triggeredRules: result.triggeredRules,
      ip: context.ip,
      email: context.email,
      userId: context.userId,
    },
  });

  /* -------------------------------------------------- */
  /* Emit alerts                                         */
  /* -------------------------------------------------- */

  if (result.block) {
    emitAlertEvent({
      event: "ALERT_RISK_SCORE_HIGH",
      metadata: {
        score: result.score,
        triggeredRules: result.triggeredRules,
        userId: context.userId,
        email: context.email,
        ip: context.ip,
      },
    });
  }

  if (result.review) {
    emitAlertEvent({
      event: "ALERT_RISK_SCORE_MEDIUM",
      metadata: {
        score: result.score,
        triggeredRules: result.triggeredRules,
        userId: context.userId,
        email: context.email,
        ip: context.ip,
      },
    });
  }

  /* -------------------------------------------------- */
  /* Return final result                                 */
  /* -------------------------------------------------- */

  return result;
}

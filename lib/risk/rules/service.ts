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

function emitAlertEvent(event: string, metadata: any) {
  emitEvent({
    kind: "alert",
    event,
    severity: "high",
    category: "risk",
    source: "risk-engine",
    metadata,
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
  const policyId = args.policyId.toLowerCase();

  /* -------------------------------------------------- */
  /* Validate policy exists                              */
  /* -------------------------------------------------- */

  // getRiskPolicy already throws if missing
  getRiskPolicy(policyId);

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

  let result: RiskEvaluationResult;

  try {
    result = await evaluatePolicy(context, policyId);
  } catch (err: any) {
    emitSecurityEvent({
      type: "SYSTEM_ANOMALY",
      message: "Risk evaluation failed",
      severity: "high",
      metadata: { error: err?.message, policyId },
    });

    await logAuditEvent({
      action: "RISK_EVALUATION_ERROR",
      actorType: "SYSTEM",
      resource: "riskPolicy",
      resourceId: policyId,
      metadata: { error: err?.message },
    });

    throw err;
  }

  /* -------------------------------------------------- */
  /* Emit audit event                                    */
  /* -------------------------------------------------- */

  await logAuditEvent({
    action: "RISK_EVALUATED",
    actorType: "SYSTEM",
    resource: "riskPolicy",
    resourceId: policyId,
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

  const alertMetadata = {
    score: result.score,
    triggeredRules: result.triggeredRules,
    userId: context.userId,
    email: context.email,
    ip: context.ip,
  };

  if (result.block) {
    emitAlertEvent("ALERT_RISK_SCORE_HIGH", alertMetadata);
  }

  if (result.review) {
    emitAlertEvent("ALERT_RISK_SCORE_MEDIUM", alertMetadata);
  }

  /* -------------------------------------------------- */
  /* Return final result                                 */
  /* -------------------------------------------------- */

  return result;
}

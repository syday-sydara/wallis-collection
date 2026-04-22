import { redirect } from "next/navigation";
import { emitSecurityEvent, emitAlertEvent } from "@/lib/events/emitter";

export async function assertRisk(params: {
  userId: string;
  riskScore: number;
  context: "login" | "checkout" | "admin" | "session";
  ip?: string | null;
  userAgent?: string | null;
}) {
  const { userId, riskScore, context, ip, userAgent } = params;

  /* -------------------------------------------------- */
  /* Determine severity                                  */
  /* -------------------------------------------------- */
  const severity =
    riskScore >= 80 ? "high" :
    riskScore >= 60 ? "medium" :
    "low";

  /* -------------------------------------------------- */
  /* Log risk evaluation                                 */
  /* -------------------------------------------------- */
  await emitSecurityEvent({
    type: "RISK_EVALUATION",
    message: `Risk score evaluated: ${riskScore} in context ${context}`,
    severity,
    actorType: "customer",
    actorId: userId,
    category: "risk",
    context,
    operation: "access",
    tags: ["risk", `risk:${severity}`, `context:${context}`],
    ip,
    userAgent,
    metadata: {
      riskScore,
      context,
    },
  });

  /* -------------------------------------------------- */
  /* HIGH RISK → BLOCK                                   */
  /* -------------------------------------------------- */
  if (riskScore >= 80) {
    await emitAlertEvent({
      event: "HIGH_RISK_BLOCK",
      userId,
      ip,
      userAgent,
      metadata: { riskScore, context },
    });

    await emitSecurityEvent({
      type: "RISK_BLOCK",
      message: `User blocked due to high risk (${riskScore})`,
      severity: "high",
      actorType: "customer",
      actorId: userId,
      category: "risk",
      context,
      operation: "access",
      tags: ["risk", "block", "high_risk"],
      ip,
      userAgent,
      metadata: { riskScore, context },
    });

    redirect("/risk-blocked");
  }

  /* -------------------------------------------------- */
  /* MEDIUM RISK → CHALLENGE (MFA / OTP)                */
  /* -------------------------------------------------- */
  if (riskScore >= 60) {
    await emitAlertEvent({
      event: "RISK_CHALLENGE_REQUIRED",
      userId,
      ip,
      userAgent,
      metadata: { riskScore, context },
    });

    await emitSecurityEvent({
      type: "RISK_CHALLENGE",
      message: `User required to complete challenge due to risk score ${riskScore}`,
      severity: "medium",
      actorType: "customer",
      actorId: userId,
      category: "risk",
      context,
      operation: "access",
      tags: ["risk", "challenge", "medium_risk"],
      ip,
      userAgent,
      metadata: { riskScore, context },
    });

    redirect("/risk-challenge");
  }

  /* -------------------------------------------------- */
  /* LOW RISK → ALLOW                                   */
  /* -------------------------------------------------- */
  await emitSecurityEvent({
    type: "RISK_ALLOW",
    message: `Risk score ${riskScore} allowed`,
    severity: "low",
    actorType: "customer",
    actorId: userId,
    category: "risk",
    context,
    operation: "access",
    tags: ["risk", "allow", "low_risk"],
    ip,
    userAgent,
    metadata: { riskScore, context },
  });

  return true;
}

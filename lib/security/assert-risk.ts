import { redirect } from "next/navigation";
import { emitSecurityEvent, emitAlertEvent } from "@/lib/security/eventBus";

export async function assertRisk(params: {
  userId: string;
  riskScore: number;
  context: "login" | "checkout" | "admin" | "session";
  ip?: string | null;
  userAgent?: string | null;
}) {
  const { userId, riskScore, context, ip, userAgent } = params;

  // Log every enforcement decision
  await emitSecurityEvent({
    type: "RISK_EVALUATION",
    message: `Risk score evaluated: ${riskScore} in context ${context}`,
    severity: riskScore >= 80 ? "high" : riskScore >= 50 ? "medium" : "low",
    userId,
    ip,
    userAgent,
    category: context,
    metadata: { riskScore },
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

    redirect("/risk-challenge");
  }

  /* -------------------------------------------------- */
  /* LOW RISK → ALLOW                                   */
  /* -------------------------------------------------- */
  return true;
}

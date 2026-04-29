// lib/security/middleware/riskMiddleware.ts

import { NextFunction, Request, Response } from "express";
import { computeUnifiedSecurityRisk } from "@/lib/security/engines/unifiedRiskEngine";
import { applyRiskPolicy } from "@/lib/security/policies/riskPolicy";

export async function riskMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const userId = (req as any).userId ?? null;
  const ip = req.ip ?? null;
  const userAgent = req.headers["user-agent"] ?? null;

  const risk = await computeUnifiedSecurityRisk({
    userId,
    ip,
    userAgent: typeof userAgent === "string" ? userAgent : null,
    source: "login",
    // you’d map real signals here
    riskSignals: {},
    unifiedSignals: {},
    fraudSignals: [],
  });

  const action = applyRiskPolicy(risk);

  if (action === "block") {
    return res.status(403).json({ error: "Access blocked due to risk" });
  }

  if (action === "challenge") {
    // you might set a flag for frontend to trigger MFA
    (req as any).riskChallengeRequired = true;
  }

  (req as any).riskResult = risk;
  return next();
}

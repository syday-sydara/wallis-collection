// lib/security/middleware/riskMiddleware.ts

import { NextFunction, Request, Response } from "express";
import { computeUnifiedSecurityRisk } from "@/lib/security/engines/unifiedRiskEngine";
import { applyRiskPolicy } from "@/lib/security/policies/riskPolicy";

interface RiskRequest extends Request {
  riskChallengeRequired?: boolean;
  riskResult?: any;
}

export async function riskMiddleware(
  req: RiskRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    /* -------------------------------------------------- */
    /* Extract & normalize signals                        */
    /* -------------------------------------------------- */

    const userId = req.userId ?? null;
    const ip = req.ip ?? null;

    const userAgentHeader = req.headers["user-agent"];
    const userAgent =
      typeof userAgentHeader === "string" ? userAgentHeader : null;

    /* -------------------------------------------------- */
    /* Compute unified risk                               */
    /* -------------------------------------------------- */

    const risk = await computeUnifiedSecurityRisk({
      userId,
      ip,
      userAgent,
      source: "login",

      // TODO: map real signals here
      riskSignals: {},
      unifiedSignals: {},
      fraudSignals: [],
    });

    /* -------------------------------------------------- */
    /* Apply risk policy                                  */
    /* -------------------------------------------------- */

    const action = applyRiskPolicy(risk);

    if (action === "block") {
      return res.status(403).json({
        status: "blocked",
        message: "Access blocked due to risk",
        risk,
      });
    }

    if (action === "challenge") {
      req.riskChallengeRequired = true;
    }

    req.riskResult = risk;
    return next();
  } catch (err: any) {
    console.error("Risk middleware error:", err);

    return res.status(500).json({
      status: "error",
      message: "Risk evaluation failed",
    });
  }
}

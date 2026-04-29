// app/api/auth/login/route.ts

import { NextRequest, NextResponse } from "next/server";
import { computeUnifiedSecurityRisk } from "@/lib/security/engines/unifiedRiskEngine";
import { applyRiskPolicy } from "@/lib/security/policies/riskPolicy";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { phone, otp } = body;

  const ip = req.ip ?? req.headers.get("x-forwarded-for") ?? null;
  const userAgent = req.headers.get("user-agent");

  // TODO: look up user, OTP attempts, device, etc.
  const userId = null; // or real user id if known at this point
  const failedLogins = 0; // derive from DB / OTP table

  const risk = await computeUnifiedSecurityRisk({
    userId,
    ip: typeof ip === "string" ? ip : null,
    userAgent,
    source: "login",
    riskSignals: {
      failedLogins,
      // newDevice, ipMismatch, highVelocity...
    },
    unifiedSignals: {
      // sessionContext, deviceContext, etc.
    },
    fraudSignals: [],
  });

  const action = applyRiskPolicy(risk);

  if (action === "block") {
    return NextResponse.json(
      { error: "Login blocked due to risk" },
      { status: 403 }
    );
  }

  if (action === "challenge") {
    // e.g. require extra step, show captcha, etc.
    return NextResponse.json(
      { challenge: true, message: "Additional verification required" },
      { status: 401 }
    );
  }

  // normal login flow here
  // - verify OTP
  // - create session
  // - set cookies

  return NextResponse.json({ success: true, risk });
}

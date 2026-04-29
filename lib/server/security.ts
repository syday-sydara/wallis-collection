// server/security.ts

import express from "express";
import { riskMiddleware } from "@/lib/security/middleware/riskMiddleware";

const router = express.Router();

// Example: login route
router.post("/auth/login", riskMiddleware, async (req, res) => {
  const { phone, otp } = req.body;

  // If riskMiddleware decided to block, it already sent a response.
  // If it decided to challenge, you can check:
  const challengeRequired = (req as any).riskChallengeRequired === true;
  const riskResult = (req as any).riskResult;

  if (challengeRequired) {
    return res.status(401).json({
      challenge: true,
      message: "Additional verification required",
      risk: riskResult,
    });
  }

  // Normal login logic:
  // - verify OTP
  // - create session
  // - respond with token/cookie

  return res.json({ success: true, risk: riskResult });
});

export default router;

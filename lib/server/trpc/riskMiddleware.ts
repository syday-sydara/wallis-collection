// server/trpc/riskMiddleware.ts

import { TRPCError, initTRPC } from "@trpc/server";
import { computeUnifiedSecurityRisk } from "@/lib/security/engines/unifiedRiskEngine";
import { applyRiskPolicy } from "@/lib/security/policies/riskPolicy";
import type { Context } from "./context";

const t = initTRPC.context<Context>().create();

export const riskMiddleware = t.middleware(async ({ ctx, next }) => {
  const risk = await computeUnifiedSecurityRisk({
    userId: ctx.userId,
    ip: ctx.ip,
    userAgent: ctx.userAgent,
    source: "login", // or "session"/"checkout" per router
    riskSignals: {},
    unifiedSignals: {},
    fraudSignals: [],
  });

  const action = applyRiskPolicy(risk);

  if (action === "block") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Blocked due to risk",
    });
  }

  const challengeRequired = action === "challenge";

  return next({
    ctx: {
      ...ctx,
      risk,
      riskChallengeRequired: challengeRequired,
    },
  });
});

export const router = t.router;
export const publicProcedure = t.procedure;
export const protectedWithRisk = t.procedure.use(riskMiddleware);

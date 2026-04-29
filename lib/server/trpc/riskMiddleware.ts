// server/trpc/riskMiddleware.ts

import { TRPCError, initTRPC } from "@trpc/server";
import { computeUnifiedSecurityRisk } from "@/lib/security/engines/unifiedRiskEngine";
import { applyRiskPolicy } from "@/lib/security/policies/riskPolicy";
import type { Context } from "./context";

const t = initTRPC.context<Context>().create();

export const riskMiddleware = t.middleware(async ({ ctx, next }) => {
  try {
    /* -------------------------------------------------- */
    /* Compute unified risk                               */
    /* -------------------------------------------------- */

    const risk = await computeUnifiedSecurityRisk({
      userId: ctx.userId,
      ip: ctx.ip,
      userAgent: ctx.userAgent,
      source: "login", // TODO: make dynamic per router
      riskSignals: {},
      unifiedSignals: {},
      fraudSignals: [],
    });

    /* -------------------------------------------------- */
    /* Apply risk policy                                  */
    /* -------------------------------------------------- */

    const action = applyRiskPolicy(risk);

    if (action === "block") {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Blocked due to risk",
      });
    }

    const challengeRequired = action === "challenge";

    /* -------------------------------------------------- */
    /* Pass risk metadata into downstream context         */
    /* -------------------------------------------------- */

    return next({
      ctx: {
        ...ctx,
        risk,
        riskChallengeRequired: challengeRequired,
      },
    });
  } catch (err: any) {
    console.error("tRPC risk middleware error:", err);

    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Risk evaluation failed",
    });
  }
});

/* -------------------------------------------------- */
/* Router + helpers                                    */
/* -------------------------------------------------- */

export const router = t.router;
export const publicProcedure = t.procedure;

// Use this for protected endpoints
export const protectedWithRisk = t.procedure.use(riskMiddleware);

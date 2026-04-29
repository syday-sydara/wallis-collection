// server/trpc/router/auth.ts

import { router, protectedWithRisk } from "../riskMiddleware";
import { z } from "zod";

export const authRouter = router({
  login: protectedWithRisk
    .input(
      z.object({
        phone: z.string(),
        otp: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (ctx.riskChallengeRequired) {
        // e.g. tell client to show extra verification
        return {
          challenge: true,
          message: "Additional verification required",
          risk: ctx.risk,
        };
      }

      // normal login logic here
      return { success: true, risk: ctx.risk };
    }),
});

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
      // Normalize phone number
      const phone = input.phone.replace(/\D/g, "");

      // Risk challenge required
      if (ctx.riskChallengeRequired) {
        return {
          status: "challenge",
          message: "Additional verification required",
          risk: ctx.risk,
        };
      }

      // TODO: verify OTP
      // const isValidOtp = await verifyOtp(phone, input.otp);
      // if (!isValidOtp) throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid OTP" });

      // TODO: create session / token
      // const token = await createSession(ctx.userId);

      return {
        status: "ok",
        risk: ctx.risk,
        // token,
      };
    }),
});

// lib/checkout/service.ts

import { prisma } from "@/lib/db";
import type { CheckoutPayload } from "./schema";
import { logEvent } from "@/lib/logger";
import { startTimer } from "@/lib/metrics";
import * as Sentry from "@sentry/nextjs";
import { calculateRiskScore } from "@/lib/risk/engine";

export async function processCheckout(payload: CheckoutPayload, ctx: RiskContext) {
  const { score, triggered } = await calculateRiskScore(ctx);

  logEvent("risk_score_calculated", {
    email: payload.email,
    score,
    triggeredRules: triggered.map(r => r.name)
  });

  // Optional: block high-risk orders
  if (score >= 50) {
    logEvent("order_blocked_high_risk", {
      email: payload.email,
      score,
      triggeredRules: triggered.map(r => r.name)
    });

    throw new Error("Order flagged as high risk");
  }
  return Sentry.startSpan(
    { name: "checkout.process", op: "service" },
    async () => {
      const endTimer = startTimer("checkout_service");

      try {
        const dbTimer = startTimer("db.order.create");

        const order = await prisma.order.create({
          data: {
            email: payload.email,
            phone: payload.phone,
            fullName: payload.fullName,
            paymentMethod: payload.paymentMethod,
            shippingType: payload.shippingType,
            address: payload.address,
            city: payload.city,
            state: payload.state,
            items: {
              create: payload.items.map((item) => ({
                productId: item.productId,
                quantity: item.quantity
              }))
            }
          }
        });

        dbTimer();

        const paymentTimer = startTimer("payment_session_create");

        // TODO: integrate Paystack/Monnify here
        const paymentUrl: string | null = null;

        paymentTimer();

        logEvent("checkout_order_created", {
          orderId: order.id,
          email: payload.email,
          itemsCount: payload.items.length
        });

        endTimer();

        return {
          orderId: order.id,
          paymentUrl
        };
      } catch (err: any) {
        Sentry.captureException(err);

        logEvent(
          "checkout_service_error",
          {
            message: err?.message,
            stack: err?.stack
          },
          "error"
        );

        endTimer();

        throw err;
      }
    }
  );
}

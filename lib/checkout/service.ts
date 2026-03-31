// lib/checkout/service.ts

import { prisma } from "@/lib/db";
import type { CheckoutPayload } from "./schema";
import { logEvent } from "@/lib/logger";
import { startTimer } from "@/lib/metrics";
import * as Sentry from "@sentry/nextjs";
import { calculateRiskScore } from "@/lib/risk/engine";
import type { RiskContext } from "@/lib/risk/types";

/**
 * Processes a checkout order
 * 1. Evaluates risk score
 * 2. Creates order in DB
 * 3. Returns orderId and optional paymentUrl
 */
export async function processCheckout(payload: CheckoutPayload, riskContext: RiskContext) {
  return Sentry.startSpan(
    { name: "checkout.process", op: "service" },
    async () => {
      const endTimer = startTimer("checkout_service");

      // ---------------- Risk Evaluation ----------------
      const { score, triggered } = await calculateRiskScore(riskContext);

      logEvent("risk_score_evaluated", {
        email: payload.email,
        score,
        triggeredRules: triggered.map((r) => r.name),
      });

      if (score >= 50) {
        logEvent("order_blocked_high_risk", {
          email: payload.email,
          score,
          triggeredRules: triggered.map((r) => r.name),
        });
        endTimer();
        throw new Error("Order flagged as high risk");
      }

      // ---------------- Create Order ----------------
      try {
        const dbTimer = startTimer("db.order.create");

        const order = await prisma.order.create({
          data: {
            email: payload.email,
            phone: payload.phone,
            fullName: payload.fullName,
            paymentMethod: payload.paymentMethod,
            paymentStatus: "PENDING",
            orderStatus: "PENDING",
            shippingType: payload.shippingType,
            shippingState: payload.state,
            shippingCost: payload.shippingCost ?? 0,
            address: payload.address,
            city: payload.city,
            state: payload.state,
            cartSnapshot: payload.items,
            total: payload.total,
            items: {
              create: payload.items.map((item) => ({
                productId: item.productId,
                name: item.name,
                image: item.image,
                variants: item.variants,
                quantity: item.quantity,
                price: item.unitPrice,
              })),
            },
          },
        });

        dbTimer();

        // ---------------- Payment Session ----------------
        const paymentTimer = startTimer("payment_session_create");
        const paymentUrl: string | null = null; // TODO: integrate Paystack / Monnify here
        paymentTimer();

        logEvent("checkout_order_created", {
          orderId: order.id,
          email: payload.email,
          itemsCount: payload.items.length,
        });

        endTimer();

        // ---------------- Return Order Info ----------------
        return {
          orderId: order.id,
          paymentUrl, // If null, you can use WhatsApp flow instead
        };
      } catch (err: any) {
        Sentry.captureException(err);
        logEvent(
          "checkout_service_error",
          { message: err?.message, stack: err?.stack },
          "error"
        );
        endTimer();
        throw err;
      }
    }
  );
}
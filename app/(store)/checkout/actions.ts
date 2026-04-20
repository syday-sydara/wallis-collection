"use server";

import * as Sentry from "@sentry/nextjs";
import { headers } from "next/headers";
import { CheckoutPayloadSchema } from "@/lib/checkout/schema";
import { processCheckout } from "@/lib/checkout/service";
import { logEvent } from "@/lib/auth/logger";
import { startTimer } from "@/lib/auth/metrics";
import { checkRateLimit } from "@/lib/api/rate-limit";
import { getIdempotentResponse, saveIdempotentResponse } from "@/lib/idempotency";
import { buildRiskContext } from "@/lib/risk/context";
import { prisma } from "@/lib/db";
import { normalizePhone, maskEmail } from "@/lib/security/normalize";

import type { CheckoutActionState } from "./state";

export async function submitCheckout(formData: FormData): Promise<CheckoutActionState> {
  return Sentry.startSpan(
    { name: "checkout.submit", op: "server.action" },
    async () => {
      const endTimer = startTimer("checkout_server_action");

      const hdrs = await headers();
      const ip = hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
      const userAgent = hdrs.get("user-agent") ?? "unknown";

      /* ---------------- Rate Limit ---------------- */
      const rate = await checkRateLimit({ route: "checkout", ip });
      if (!rate.allowed) {
        endTimer();
        return {
          success: false,
          message: "Too many attempts. Please wait a moment and try again.",
          fieldErrors: {}
        };
      }

      /* ---------------- Idempotency ---------------- */
      const idempotencyKey = formData.get("idempotencyKey") as string | null;
      if (!idempotencyKey) {
        endTimer();
        return {
          success: false,
          message: "Missing idempotency key",
          fieldErrors: {}
        };
      }

      const cached = getIdempotentResponse(idempotencyKey);
      if (cached) {
        endTimer();
        return cached;
      }

      try {
        /* ---------------- Extract Raw Form Data ---------------- */
        const raw: Record<string, any> = {};
        formData.forEach((value, key) => {
          raw[key] = typeof value === "string" ? value.trim() : value;
        });

        /* ---------------- Parse Items ---------------- */
        let items;
        try {
          items = JSON.parse(raw.items);
        } catch {
          endTimer();
          return {
            success: false,
            message: "Invalid cart data",
            fieldErrors: { items: ["Invalid items format"] }
          };
        }

        if (!Array.isArray(items) || items.length === 0) {
          endTimer();
          return {
            success: false,
            message: "Your cart is empty",
            fieldErrors: {}
          };
        }

        /* ---------------- Normalize Sensitive Fields ---------------- */
        const normalizedPhone = normalizePhone(raw.phone);
        const maskedEmail = maskEmail(raw.email);

        const payload = {
          email: raw.email,
          phone: normalizedPhone,
          fullName: raw.fullName,
          paymentMethod: raw.paymentMethod,
          shippingType: raw.shippingType,
          address: raw.address,
          city: raw.city,
          state: raw.state,
          items
        };

        /* ---------------- Validate Payload ---------------- */
        const parsed = CheckoutPayloadSchema.safeParse(payload);
        if (!parsed.success) {
          const flattened = parsed.error.flatten().fieldErrors;
          endTimer();
          return {
            success: false,
            message: "Please correct the highlighted fields",
            fieldErrors: flattened
          };
        }

        /* ---------------- Fetch Server Prices ---------------- */
        const productIds = parsed.data.items.map(i => i.productId);
        const products = await prisma.product.findMany({
          where: { id: { in: productIds } },
          select: { id: true, basePrice: true, name: true, inStock: true }
        });

        const priceMap = new Map(products.map(p => [p.id, p]));

        /* ---------------- Validate Cart Items ---------------- */
        for (const item of parsed.data.items) {
          const product = priceMap.get(item.productId);

          if (!product) {
            return {
              success: false,
              message: "One or more items are no longer available",
              fieldErrors: {}
            };
          }

          if (!product.inStock) {
            return {
              success: false,
              message: `${product.name} is out of stock`,
              fieldErrors: {}
            };
          }

          if (item.quantity < 1 || item.quantity > 10) {
            return {
              success: false,
              message: "Invalid quantity selected",
              fieldErrors: {}
            };
          }
        }

        /* ---------------- Compute Cart Value ---------------- */
        const cartValue = parsed.data.items.reduce((sum, item) => {
          const product = priceMap.get(item.productId);
          return sum + (product?.basePrice ?? 0) * item.quantity;
        }, 0);

        /* ---------------- Build Risk Context ---------------- */
        const riskContext = buildRiskContext({
          ip,
          email: parsed.data.email,
          phone: parsed.data.phone,
          userAgent,
          attempts: rate.remaining,
          cartValue,
          shippingState: parsed.data.state
        });

        /* ---------------- Process Checkout ---------------- */
        const result = await processCheckout(parsed.data, riskContext);

        const response: CheckoutActionState = {
          success: true,
          message: null,
          fieldErrors: {},
          orderId: result.orderId,
          paymentUrl: result.paymentUrl ?? null
        };

        saveIdempotentResponse(idempotencyKey, response);
        endTimer();
        return response;
      } catch (err: any) {
        Sentry.captureException(err);
        endTimer();
        return {
          success: false,
          message: "Unexpected error occurred. Please try again.",
          fieldErrors: {}
        };
      }
    }
  );
}

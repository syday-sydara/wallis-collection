// lib/analytics.ts
import { prisma } from "@/lib/db";

export type AnalyticsEvent =
  | "ORDER_CREATED"
  | "ORDER_PAID"
  | "ORDER_CANCELLED"
  | "PRODUCT_VIEWED"
  | "CART_UPDATED"
  | "CHECKOUT_STARTED"
  | "PAYMENT_FAILED";

export interface AnalyticsPayload {
  userId?: string | null;
  orderId?: string | null;
  productId?: string | null;
  value?: number | null;
  metadata?: Record<string, any>;
}

/* ---------------------------------- */
/* Save event to database             */
/* ---------------------------------- */
export async function trackEvent(
  event: AnalyticsEvent,
  payload: AnalyticsPayload = {}
) {
  try {
    await prisma.analyticsEvent.create({
      data: {
        event,
        userId: payload.userId ?? null,
        orderId: payload.orderId ?? null,
        productId: payload.productId ?? null,
        value: payload.value ?? null,
        metadata: payload.metadata ?? {},
      },
    });
  } catch (err) {
    console.error("Analytics tracking failed:", err);
  }
}

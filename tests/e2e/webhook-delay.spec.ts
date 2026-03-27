import { test, expect } from "@playwright/test";

test("order is confirmed even if webhook arrives late", async ({ request }) => {
  const orderId = "test-order-123";

  const webhookPayload = {
    event: "charge.success",
    data: { reference: orderId }
  };

  const res = await request.post("/api/webhooks/paystack", {
    data: webhookPayload
  });

  expect(res.ok()).toBeTruthy();

  const order = await request.get(`/api/debug/order/${orderId}`);
  const json = await order.json();

  expect(json.paymentStatus).toBe("PAID");
});

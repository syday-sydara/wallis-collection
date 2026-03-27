import { describe, it, expect } from "vitest";
import { CheckoutPayloadSchema } from "@/lib/checkout/schema";

describe("CheckoutPayloadSchema", () => {
  it("validates a correct payload", () => {
    const result = CheckoutPayloadSchema.safeParse({
      email: "test@example.com",
      phone: "08012345678",
      fullName: "John Doe",
      paymentMethod: "PAYSTACK",
      shippingType: "STANDARD",
      address: "123 Street",
      city: "Lagos",
      state: "Lagos",
      items: [{ productId: "abc123", quantity: 1 }]
    });

    expect(result.success).toBe(true);
  });

  it("rejects invalid Nigerian phone numbers", () => {
    const result = CheckoutPayloadSchema.safeParse({
      email: "test@example.com",
      phone: "12345",
      fullName: "John Doe",
      paymentMethod: "PAYSTACK",
      shippingType: "STANDARD",
      address: "123 Street",
      city: "Lagos",
      state: "Lagos",
      items: [{ productId: "abc123", quantity: 1 }]
    });

    expect(result.success).toBe(false);
  });
});

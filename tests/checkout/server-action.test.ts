import { describe, it, expect, vi } from "vitest";
import { submitCheckout } from "@/app/(store)/checkout/actions";
import * as service from "@/lib/checkout/service";

vi.mock("@/lib/checkout/service");

describe("submitCheckout", () => {
  it("returns field errors for invalid payload", async () => {
    const fd = new FormData();
    fd.append("email", "invalid");
    fd.append("items", JSON.stringify([]));

    const result = await submitCheckout(
      { success: null, message: null, fieldErrors: {} },
      fd
    );

    expect(result.success).toBe(false);
    expect(result.fieldErrors.email).toBeDefined();
  });

  it("returns success for valid payload", async () => {
    vi.spyOn(service, "processCheckout").mockResolvedValue({
      orderId: "order123",
      paymentUrl: "https://paystack.com/pay/123"
    });

    const fd = new FormData();
    fd.append("email", "test@example.com");
    fd.append("phone", "08012345678");
    fd.append("fullName", "John Doe");
    fd.append("paymentMethod", "PAYSTACK");
    fd.append("shippingType", "STANDARD");
    fd.append("address", "123 Street");
    fd.append("city", "Lagos");
    fd.append("state", "Lagos");
    fd.append("items", JSON.stringify([{ productId: "abc", quantity: 1 }]));

    const result = await submitCheckout(
      { success: null, message: null, fieldErrors: {} },
      fd
    );

    expect(result.success).toBe(true);
    expect(result.orderId).toBe("order123");
  });
});

import { describe, it, expect, vi } from "vitest";
import { submitCheckoutImpl } from "@/lib/checkout/submitCheckout";
import * as service from "@/lib/checkout/service";

vi.mock("@prisma/client");          // prevents DB initialization
vi.mock("@/lib/checkout/service");  // prevents real checkout logic

describe("Checkout Integration", () => {
  it("handles full checkout flow", async () => {
    vi.spyOn(service, "processCheckout").mockResolvedValue({
      orderId: "order123",
      paymentUrl: null
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

    const result = await submitCheckoutImpl(
      { success: null, message: null, fieldErrors: {} },
      fd
    );

    expect(result.success).toBe(true);
    expect(result.orderId).toBe("order123");
  });
});
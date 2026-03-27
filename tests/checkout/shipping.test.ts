import { describe, it, expect } from "vitest";
import { getShippingPreview, validateExpressAddress } from "@/lib/checkout/shipping";

describe("Shipping Logic", () => {
  it("calculates Lagos standard shipping", () => {
    const result = getShippingPreview("Lagos", "STANDARD");
    expect(result?.cost).toBe(1500);
  });

  it("calculates express shipping", () => {
    const result = getShippingPreview("Kano", "EXPRESS");
    expect(result?.cost).toBe(3500);
  });

  it("requires full address for express", () => {
    const error = validateExpressAddress({
      shippingType: "EXPRESS",
      address: "",
      city: "Lagos",
      state: "Lagos"
    });

    expect(error).toBeTruthy();
  });
});

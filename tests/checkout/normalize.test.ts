import { describe, it, expect } from "vitest";
import { submitCheckout } from "@/app/(store)/checkout/actions";

describe("FormData normalization", () => {
  it("rejects invalid items JSON", async () => {
    const fd = new FormData();
    fd.append("email", "test@example.com");
    fd.append("items", "not-json");

    const result = await submitCheckout(
      { success: null, message: null, fieldErrors: {} },
      fd
    );

    expect(result.success).toBe(false);
    expect(result.fieldErrors.items).toBeDefined();
  });
});

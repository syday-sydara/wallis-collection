import { describe, it, expect, vi } from "vitest";
import { submitCheckoutImpl } from "@/lib/checkout/submitCheckout";

vi.mock("@prisma/client");          // prevents DB initialization
vi.mock("@/lib/checkout/service");  // prevents real checkout logic

describe("FormData normalization", () => {
  it("rejects invalid items JSON", async () => {
    const fd = new FormData();
    fd.append("email", "test@example.com");
    fd.append("items", "not-json");

    const result = await submitCheckoutImpl(
      { success: null, message: null, fieldErrors: {} },
      fd
    );

    expect(result.success).toBe(false);
    expect(result.fieldErrors.items).toBeDefined();
  });
});
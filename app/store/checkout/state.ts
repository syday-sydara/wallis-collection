export type CheckoutActionState = {
  status: "idle" | "submitting" | "success" | "error";

  /** Human‑readable message for UI */
  message: string | null;

  /** Field‑level validation errors */
  errors: Record<string, string[] | undefined>;

  /** Optional machine‑readable error code */
  errorCode?: string | null;

  /** For successful checkouts */
  orderId?: string;
  paymentUrl?: string | null;
  redirectUrl?: string | null;

  /** Updated on every state change */
  timestamp: number;
};

export const checkoutInitialState: CheckoutActionState = {
  status: "idle",
  message: null,
  errors: {},
  errorCode: null,
  paymentUrl: null,
  redirectUrl: null,
  orderId: undefined,
  timestamp: Date.now(),
};

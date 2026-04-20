export type CheckoutActionState = {
  status: "idle" | "error" | "success";
  success: boolean | null;
  message: string | null;
  errorCode?: string | null;
  fieldErrors: Record<string, string[] | undefined>;
  validationErrors?: Record<string, string[] | undefined>;
  orderId?: string;
  paymentUrl?: string | null;
  redirectUrl?: string | null;
  timestamp?: number;
};

export const checkoutInitialState: CheckoutActionState = {
  status: "idle",
  success: null,
  message: null,
  fieldErrors: {},
  validationErrors: {},
  errorCode: null,
  redirectUrl: null,
  paymentUrl: null,
  orderId: undefined,
  timestamp: Date.now(),
};

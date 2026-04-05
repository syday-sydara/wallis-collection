export type CheckoutActionState = {
  success: boolean | null;
  message: string | null;
  fieldErrors: Record<string, string[] | undefined>;
  orderId?: string;
  paymentUrl?: string | null;
};

export const checkoutInitialState: CheckoutActionState = {
  success: null,
  message: null,
  fieldErrors: {},
};
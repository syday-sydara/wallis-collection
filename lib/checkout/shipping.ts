// lib/checkout/shipping.ts
const STATE_SHIPPING: Record<string, number> = {
  Lagos: 1500_00,
  FCT: 1500_00,
  default: 2500_00
};

export function getShippingCost(state: string) {
  return STATE_SHIPPING[state] ?? STATE_SHIPPING.default;
}

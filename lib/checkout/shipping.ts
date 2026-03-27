export type ShippingType = "STANDARD" | "EXPRESS";

export function getShippingPreview(state: string, shippingType: ShippingType) {
  if (!state) return null;

  const base = ["Lagos", "FCT"].includes(state) ? 1500 : 2500;
  const extra = shippingType === "EXPRESS" ? 1000 : 0;

  return {
    cost: base + extra,
    eta: shippingType === "EXPRESS" ? "1–2 business days" : "3–5 business days"
  };
}

export function validateExpressAddress(params: {
  shippingType: ShippingType;
  address: string;
  city: string;
  state: string;
}) {
  if (params.shippingType !== "EXPRESS") return null;

  if (!params.address || !params.city || !params.state) {
    return "Express shipping requires a full address (street, city, and state).";
  }

  return null;
}

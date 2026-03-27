export function getShippingPreview(state: string, shippingType: string) {
  if (!state) return null;

  const base = ["Lagos", "FCT"].includes(state) ? 1500 : 2500;
  const extra = shippingType === "EXPRESS" ? 1000 : 0;

  return {
    cost: base + extra,
    eta: shippingType === "EXPRESS" ? "1–2 business days" : "3–5 business days"
  };
}

import { NIGERIAN_STATES } from "./constants";

export type ShippingType = "STANDARD" | "EXPRESS";

export interface ShippingPreview {
  cost: number;
  eta: string;
}

const METRO_STATES = new Set(["Lagos", "FCT"]);

export function getShippingPreview(
  state: string,
  shippingType: ShippingType
): ShippingPreview | null {
  if (!state) return null;

  const normalized = state.trim();

  if (!NIGERIAN_STATES.includes(normalized)) {
    console.warn(`Unknown state "${state}" for shipping calculation.`);
    return null;
  }

  const base = METRO_STATES.has(normalized) ? 1500 : 2500;
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
}): string | null {
  if (params.shippingType !== "EXPRESS") return null;

  if (!params.address || !params.city || !params.state) {
    return "Express shipping requires a full address (street, city, and state).";
  }

  if (!NIGERIAN_STATES.includes(params.state.trim())) {
    return "Please select a valid Nigerian state for express shipping.";
  }

  return null;
}

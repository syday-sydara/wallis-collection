import { NIGERIAN_STATES } from "../constants/nigerian-states";

export type ShippingType = "STANDARD" | "EXPRESS";

export interface ShippingPreview {
  cost: number;
  eta: string;
}

const METRO_STATES = new Set(["Lagos", "FCT"]);
const STATE_SET = new Set<string>(NIGERIAN_STATES);

function normalizeState(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

export function getShippingPreview(
  state: string,
  shippingType: ShippingType
): ShippingPreview | null {
  if (!state) return null;

  const normalized = normalizeState(state);

  if (!STATE_SET.has(normalized)) {
    console.warn(`Unknown Nigerian state provided for shipping calculation.`);
    return null;
  }

  const base = METRO_STATES.has(normalized) ? 1500 : 2500;
  const extra = shippingType === "EXPRESS" ? 1000 : 0;

  return {
    cost: base + extra,
    eta:
      shippingType === "EXPRESS"
        ? "1–2 business days"
        : "3–5 business days",
  };
}

export function validateExpressAddress(params: {
  shippingType: ShippingType;
  address: string;
  city: string;
  state: string;
}): string | null {
  if (params.shippingType !== "EXPRESS") return null;

  const address = params.address?.trim();
  const city = params.city?.trim();
  const state = normalizeState(params.state);

  if (!address || !city || !state) {
    return "Express shipping requires a full address (street, city, and state).";
  }

  if (!STATE_SET.has(state)) {
    return "Please select a valid Nigerian state for express shipping.";
  }

  return null;
}

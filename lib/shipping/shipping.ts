// PATH: lib/shipping/shipping.ts

/* ------------------------------------------------------------
   Nigerian Shipping Rules for Wallis Collection
   Supports: Riders, Motor Park, Pickup, Nationwide Logistics
   Now includes:
   - LGA pricing
   - Free shipping thresholds
   - Item-count surcharges
   - UI formatting helpers
------------------------------------------------------------- */

export type ShippingMethod =
  | "rider"
  | "motor_park"
  | "pickup"
  | "logistics";

export interface ShippingOption {
  method: ShippingMethod;
  label: string;
  price: number; // in Naira
  eta: string;
  note?: string;
}

export interface ShippingRule {
  state: string;
  lgas?: Record<string, number>; // optional LGA-specific pricing
  options: ShippingOption[];
}

/* ------------------------------------------------------------
   Base Pricing (Naira)
------------------------------------------------------------- */
const BASE = {
  rider: 1500,
  motorPark: 2500,
  logistics: 3500,
  pickup: 0,
};

/* ------------------------------------------------------------
   Free Shipping Threshold
------------------------------------------------------------- */
export const FREE_SHIPPING_THRESHOLD = 50000;

/* ------------------------------------------------------------
   State Groups
------------------------------------------------------------- */
const LAGOS_STATES = ["Lagos"];
const ABUJA_STATES = ["Abuja", "FCT"];
const NORTHERN_CORE = ["Kaduna", "Kano", "Katsina", "Zamfara", "Sokoto", "Kebbi"];
const SOUTH_WEST = ["Oyo", "Ogun", "Osun", "Ondo", "Ekiti"];
const SOUTH_EAST = ["Enugu", "Anambra", "Imo", "Abia", "Ebonyi"];
const SOUTH_SOUTH = ["Rivers", "Delta", "Edo", "Akwa Ibom", "Cross River", "Bayelsa"];

/* ------------------------------------------------------------
   Shipping Rules by Region
------------------------------------------------------------- */
export const SHIPPING_RULES: ShippingRule[] = [
  {
    state: "Lagos",
    lgas: {
      Lekki: 2000,
      Ajah: 2000,
      Ikorodu: 2500,
      Yaba: 1500,
      Surulere: 1500,
      Ikeja: 1500,
    },
    options: [
      {
        method: "rider",
        label: "Dispatch Rider (Same Day)",
        price: BASE.rider,
        eta: "Same day (1–4 hours)",
      },
      {
        method: "pickup",
        label: "Store Pickup",
        price: BASE.pickup,
        eta: "Ready in 1 hour",
      },
    ],
  },

  {
    state: "Abuja",
    lgas: {
      Wuse: 2000,
      Garki: 2000,
      Maitama: 2500,
      Kubwa: 2500,
    },
    options: [
      {
        method: "rider",
        label: "Dispatch Rider",
        price: BASE.rider + 500,
        eta: "Same day (2–6 hours)",
      },
      {
        method: "pickup",
        label: "Pickup Point",
        price: BASE.pickup,
        eta: "Ready in 1 hour",
      },
    ],
  },

  ...NORTHERN_CORE.map((state) => ({
    state,
    options: [
      {
        method: "motor_park",
        label: "Motor Park Delivery",
        price: BASE.motorPark,
        eta: "Next day (Park-to-Park)",
        note: "Customer picks up at designated motor park",
      },
      {
        method: "logistics",
        label: "Nationwide Logistics",
        price: BASE.logistics,
        eta: "2–4 days",
      },
    ],
  })),

  ...SOUTH_WEST.map((state) => ({
    state,
    options: [
      {
        method: "logistics",
        label: "Logistics Delivery",
        price: BASE.logistics,
        eta: "1–3 days",
      },
    ],
  })),

  ...SOUTH_EAST.map((state) => ({
    state,
    options: [
      {
        method: "motor_park",
        label: "Motor Park Delivery",
        price: BASE.motorPark + 500,
        eta: "Next day",
      },
      {
        method: "logistics",
        label: "Nationwide Logistics",
        price: BASE.logistics + 500,
        eta: "2–4 days",
      },
    ],
  })),

  ...SOUTH_SOUTH.map((state) => ({
    state,
    options: [
      {
        method: "logistics",
        label: "Logistics Delivery",
        price: BASE.logistics + 500,
        eta: "2–4 days",
      },
    ],
  })),
];

/* ------------------------------------------------------------
   Helpers
------------------------------------------------------------- */

const normalize = (s: string) => s.trim().toLowerCase();

/** Get shipping options for a given state */
export function getShippingOptions(state: string): ShippingOption[] {
  const rule = SHIPPING_RULES.find(
    (r) => normalize(r.state) === normalize(state)
  );

  if (!rule) {
    return [
      {
        method: "logistics",
        label: "Nationwide Logistics",
        price: BASE.logistics + 1000,
        eta: "3–5 days",
      },
    ];
  }

  return rule.options;
}

/** Apply LGA-specific pricing if available */
export function applyLgaPricing(
  state: string,
  lga: string | null,
  options: ShippingOption[]
): ShippingOption[] {
  const rule = SHIPPING_RULES.find(
    (r) => normalize(r.state) === normalize(state)
  );

  if (!rule || !rule.lgas || !lga) return options;

  const lgaPrice = rule.lgas[lga];

  if (!lgaPrice) return options;

  return options.map((opt) =>
    opt.method === "rider"
      ? { ...opt, price: lgaPrice }
      : opt
  );
}

/** Apply free shipping threshold */
export function applyFreeShipping(
  options: ShippingOption[],
  subtotal: number
): ShippingOption[] {
  if (subtotal < FREE_SHIPPING_THRESHOLD) return options;

  return options.map((opt) => ({
    ...opt,
    price: 0,
    note: "Free shipping applied",
  }));
}

/** Apply item-count surcharge */
export function applyItemSurcharge(
  options: ShippingOption[],
  itemCount: number
): ShippingOption[] {
  if (itemCount <= 3) return options;

  return options.map((opt) => ({
    ...opt,
    price: opt.price + 500,
    note: "Bulk order surcharge applied",
  }));
}

/** Get the cheapest shipping option for a state */
export function getCheapestShipping(state: string): ShippingOption {
  const options = getShippingOptions(state);
  return options.reduce((min, opt) => (opt.price < min.price ? opt : min));
}

/** Format options for UI */
export function formatShippingForUI(options: ShippingOption[]) {
  return options.map((opt) => ({
    value: opt.method,
    label: `${opt.label} — ₦${opt.price.toLocaleString()} (${opt.eta})`,
    note: opt.note,
  }));
}

/** List all states with defined shipping rules */
export const ALL_SHIPPING_STATES = SHIPPING_RULES.map((r) => r.state);

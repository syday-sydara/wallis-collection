// lib/constants/nigerian-states.ts

export const NIGERIAN_STATES = Object.freeze([
  "Abia",
  "Adamawa",
  "Akwa Ibom",
  "Anambra",
  "Bauchi",
  "Bayelsa",
  "Benue",
  "Borno",
  "Cross River",
  "Delta",
  "Ebonyi",
  "Edo",
  "Ekiti",
  "Enugu",
  "FCT",
  "Gombe",
  "Imo",
  "Jigawa",
  "Kaduna",
  "Kano",
  "Katsina",
  "Kebbi",
  "Kogi",
  "Kwara",
  "Lagos",
  "Nasarawa",
  "Niger",
  "Ogun",
  "Ondo",
  "Osun",
  "Oyo",
  "Plateau",
  "Rivers",
  "Sokoto",
  "Taraba",
  "Yobe",
  "Zamfara",
] as const);

export type NigerianState = (typeof NIGERIAN_STATES)[number];

/* -------------------------------------------------- */
/* Fast lookup set                                     */
/* -------------------------------------------------- */

const STATE_SET = new Set<string>(NIGERIAN_STATES);

/* -------------------------------------------------- */
/* Normalizer                                          */
/* -------------------------------------------------- */

export function normalizeNigerianState(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

/* -------------------------------------------------- */
/* Safe parser                                         */
/* -------------------------------------------------- */

export function parseNigerianState(
  value: string | null | undefined
): NigerianState | null {
  if (!value) return null;

  const normalized = normalizeNigerianState(value);

  // Case-insensitive match
  for (const state of NIGERIAN_STATES) {
    if (state.toLowerCase() === normalized.toLowerCase()) {
      return state;
    }
  }

  return null;
}

/* -------------------------------------------------- */
/* Membership check                                    */
/* -------------------------------------------------- */

export function isNigerianState(value: string): value is NigerianState {
  return STATE_SET.has(value);
}

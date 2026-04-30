// lib/utils/formatters/phone-number.ts

import {
  parsePhoneNumberFromString,
  type PhoneNumber as LibPhone,
  type CountryCode,
} from "libphonenumber-js";

const CARRIER_PREFIXES: Record<string, string[]> = {
  MTN: [
    "703",
    "706",
    "803",
    "806",
    "810",
    "813",
    "814",
    "816",
    "903",
    "906",
    "913",
    "916",
  ],
  Airtel: [
    "701",
    "708",
    "802",
    "808",
    "812",
    "902",
    "907",
    "901",
    "904",
    "912",
  ],
  Glo: ["705", "805", "807", "811", "815", "905", "915"],
  "9mobile": ["809", "817", "818", "908", "909"],
  Smile: ["702"],
  Ntel: ["804"],
};

/**
 * Wrapper around libphonenumber-js with Nigerian carrier detection.
 *
 * Supports:
 * - validation
 * - E.164 formatting
 * - national formatting
 * - international formatting
 * - carrier lookup (NG only)
 * - WhatsApp-ready formatting
 * - masking
 */
export class PhoneNumber {
  private parsed: LibPhone | undefined;

  constructor(input: string, defaultCountry: CountryCode = "NG") {
    try {
      this.parsed =
        parsePhoneNumberFromString(input, defaultCountry) ?? undefined;
    } catch {
      this.parsed = undefined;
    }
  }

  /** Whether the phone number is valid */
  isValid(): boolean {
    return !!this.parsed?.isValid();
  }

  /** E.164 format (+2348012345678) */
  get e164(): string | null {
    return this.isValid() ? this.parsed!.number : null;
  }

  /** Country code (e.g., "NG") */
  get country(): string | null {
    return this.isValid() ? (this.parsed!.country ?? null) : null;
  }

  /** National number (e.g., 8012345678) */
  get national(): string | null {
    return this.isValid() ? this.parsed!.nationalNumber : null;
  }

  /** Detect Nigerian carrier based on prefix */
  get carrier(): string | null {
    if (!this.isValid() || this.country !== "NG") return null;

    const digits = this.parsed!.nationalNumber;

    for (const [carrier, prefixes] of Object.entries(CARRIER_PREFIXES)) {
      if (prefixes.some((p) => digits.startsWith(p))) {
        return carrier;
      }
    }

    return null;
  }

  /** +234 801 234 5678 */
  formatInternational(): string | null {
    return this.isValid() ? this.parsed!.formatInternational() : null;
  }

  /** 0801 234 5678 */
  formatNational(): string | null {
    return this.isValid() ? this.parsed!.formatNational() : null;
  }

  /** WhatsApp-ready number (2348012345678) */
  toWhatsApp(): string | null {
    return this.isValid() ? this.parsed!.number.replace(/^\+/, "") : null;
  }

  /** Masked number (2348***678) */
  mask(): string | null {
    if (!this.isValid()) return null;

    const digits = this.parsed!.number.replace(/^\+/, "");

    if (digits.length <= 7) {
      return `${digits.slice(0, 2)}***${digits.slice(-2)}`;
    }

    return `${digits.slice(0, 4)}***${digits.slice(-3)}`;
  }

  /** Raw libphonenumber-js instance (advanced use only) */
  get raw(): LibPhone | undefined {
    return this.parsed;
  }
}

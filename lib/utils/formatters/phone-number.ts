import { parsePhoneNumberFromString } from "libphonenumber-js";

const CARRIER_PREFIXES = {
  MTN: ["703","706","803","806","810","813","814","816","903","906","913","916"],
  Airtel: ["701","708","802","808","812","902","907","901","904","912"],
  Glo: ["705","805","807","811","815","905","915"],
  "9mobile": ["809","817","818","908","909"],
  Smile: ["702"],
  Ntel: ["804"],
};

export class PhoneNumber {
  private parsed;

  constructor(input: string, defaultCountry = "NG") {
    this.parsed = parsePhoneNumberFromString(input, { defaultCountry });
  }

  isValid() {
    return !!this.parsed?.isValid();
  }

  get e164() {
    return this.isValid() ? this.parsed!.number : null;
  }

  get country() {
    return this.isValid() ? this.parsed!.country : null;
  }

  get national() {
    return this.isValid() ? this.parsed!.nationalNumber : null;
  }

  get carrier() {
    if (!this.isValid() || this.country !== "NG") return null;
    const digits = this.parsed!.nationalNumber;
    return Object.entries(CARRIER_PREFIXES).find(([_, p]) =>
      p.some((x) => digits.startsWith(x))
    )?.[0] ?? null;
  }

  formatInternational() {
    return this.isValid() ? this.parsed!.formatInternational() : null;
  }

  formatNational() {
    return this.isValid() ? this.parsed!.formatNational() : null;
  }

  toWhatsApp() {
    return this.isValid() ? this.parsed!.number.replace(/^\+/, "") : null;
  }

  mask() {
    if (!this.isValid()) return null;
    const digits = this.parsed!.number.replace(/^\+/, "");
    return `${digits.slice(0, 4)}***${digits.slice(-3)}`;
  }
}

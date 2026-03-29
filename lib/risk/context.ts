// lib/risk/context.ts

import type { RiskContext } from "./types";

export function buildRiskContext(args: {
  ip: string;
  email: string;
  phone: string;
  userAgent: string;
  attempts: number;
  cartValue: number;
  shippingState: string;
}): RiskContext {
  const emailDomain = args.email.split("@")[1] ?? "";
  const phoneRegion = args.phone.slice(0, 4);

  return {
    ip: args.ip,
    email: args.email,
    emailDomain,
    phone: args.phone,
    phoneRegion,
    userAgent: args.userAgent,
    attempts: args.attempts,
    cartValue: args.cartValue,
    shippingState: args.shippingState
  };
}

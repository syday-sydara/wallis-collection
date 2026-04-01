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

  const freeEmailProviders = ["gmail.com", "yahoo.com", "outlook.com", "hotmail.com"];
  const isFreeEmail = freeEmailProviders.includes(emailDomain.toLowerCase());

  const isMobile = /Android|iPhone|iPad/i.test(args.userAgent);
  const isBot = /bot|crawl|spider/i.test(args.userAgent);

  const isPrivateIp =
    args.ip.startsWith("10.") ||
    args.ip.startsWith("192.168.") ||
    args.ip.startsWith("172.16.");

  return {
    ip: args.ip,
    email: args.email,
    emailDomain,
    isFreeEmail,

    phone: args.phone,
    phoneRegion,

    userAgent: args.userAgent,
    isMobile,
    isBot,

    attempts: args.attempts,
    cartValue: args.cartValue,

    shippingState: args.shippingState,
    isPrivateIp,
  };
}
// lib/fraud-rules.ts

import type { FraudSignal } from "@/lib/fraud-combiner";

export interface FraudRuleInput {
  email: string;
  phone?: string;
  amount: number;
  items: { name: string; quantity: number; price: number }[];
  shippingType: "DELIVERY" | "PICKUP";
  address?: string;
  city?: string;
  state?: string;
  ip?: string;
}

/* ---------------------------------- */
/* Rule: Order Amount                 */
/* ---------------------------------- */
function ruleOrderAmount(data: FraudRuleInput): FraudSignal {
  const reasons: string[] = [];
  let score = 0;

  if (data.amount > 150000) {
    score += 25;
    reasons.push("High order amount");
  }

  if (data.amount < 3000) {
    score -= 10;
  }

  return { name: "orderAmount", score, reasons };
}

/* ---------------------------------- */
/* Rule: Shipping Behavior            */
/* ---------------------------------- */
function ruleShipping(data: FraudRuleInput): FraudSignal {
  const reasons: string[] = [];
  let score = 0;

  if (data.shippingType === "DELIVERY" && !data.address) {
    score += 30;
    reasons.push("Delivery selected but no address provided");
  }

  if (data.shippingType === "PICKUP") {
    score -= 10;
  }

  return { name: "shipping", score, reasons };
}

/* ---------------------------------- */
/* Rule: Item Quantity                */
/* ---------------------------------- */
function ruleItemQuantities(data: FraudRuleInput): FraudSignal {
  const reasons: string[] = [];
  let score = 0;

  for (const item of data.items) {
    if (item.quantity >= 5) {
      score += 20;
      reasons.push(`High quantity for item: ${item.name}`);
    }
  }

  return { name: "itemQuantities", score, reasons };
}

/* ---------------------------------- */
/* Rule: Email Pattern                */
/* ---------------------------------- */
function ruleEmailPattern(data: FraudRuleInput): FraudSignal {
  const reasons: string[] = [];
  let score = 0;

  const email = data.email.toLowerCase();

  if (email.includes("+")) {
    score += 10;
    reasons.push("Email alias detected");
  }

  if (email.endsWith("@mailinator.com") || email.endsWith("@tempmail.com")) {
    score += 25;
    reasons.push("Disposable email detected");
  }

  return { name: "emailPattern", score, reasons };
}

/* ---------------------------------- */
/* Rule: IP Address (basic)           */
/* ---------------------------------- */
function ruleIpAddress(data: FraudRuleInput): FraudSignal {
  const reasons: string[] = [];
  let score = 0;

  if (!data.ip) {
    score += 10;
    reasons.push("Missing IP address");
    return { name: "ipAddress", score, reasons };
  }

  // Example: flag private or malformed IPs
  if (data.ip.startsWith("10.") || data.ip.startsWith("192.168.")) {
    score += 5;
    reasons.push("Private IP address");
  }

  return { name: "ipAddress", score, reasons };
}

/* ---------------------------------- */
/* Main Rules Engine                  */
/* ---------------------------------- */
export function runFraudRules(data: FraudRuleInput): FraudSignal[] {
  return [
    ruleOrderAmount(data),
    ruleShipping(data),
    ruleItemQuantities(data),
    ruleEmailPattern(data),
    ruleIpAddress(data),
  ];
}

// lib/fraud.ts

export type FraudRiskLevel = "LOW" | "MEDIUM" | "HIGH";

export interface FraudCheckInput {
  orderId: string;
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

export interface FraudCheckResult {
  score: number; // 0–100
  level: FraudRiskLevel;
  reasons: string[];
}

/* ---------------------------------- */
/* Rule-based scoring                 */
/* ---------------------------------- */
function ruleBasedScore(data: FraudCheckInput) {
  let score = 0;
  const reasons: string[] = [];

  // Very small orders are rarely fraudulent
  if (data.amount < 3000) {
    score -= 10;
  }

  // Large orders increase risk
  if (data.amount > 150000) {
    score += 20;
    reasons.push("High order amount");
  }

  // Pickup orders are lower risk
  if (data.shippingType === "PICKUP") {
    score -= 10;
  }

  // Missing address for delivery
  if (data.shippingType === "DELIVERY" && !data.address) {
    score += 25;
    reasons.push("Missing delivery address");
  }

  // Multiple quantities of same item
  if (data.items.some((i) => i.quantity >= 5)) {
    score += 15;
    reasons.push("Unusually high quantity of an item");
  }

  // Suspicious email patterns
  if (data.email.includes("+") || data.email.endsWith("@mailinator.com")) {
    score += 20;
    reasons.push("Disposable or alias email");
  }

  return { score, reasons };
}

/* ---------------------------------- */
/* AI-assisted scoring (optional)     */
/* ---------------------------------- */
async function aiScore(data: FraudCheckInput) {
  // You can plug in any AI provider here.
  // For now, return a neutral score.
  return 0;
}

/* ---------------------------------- */
/* Combined fraud check               */
/* ---------------------------------- */
export async function checkFraud(data: FraudCheckInput): Promise<FraudCheckResult> {
  const rule = ruleBasedScore(data);
  const ai = await aiScore(data);

  const finalScore = Math.min(100, Math.max(0, rule.score + ai));

  let level: FraudRiskLevel = "LOW";
  if (finalScore >= 70) level = "HIGH";
  else if (finalScore >= 40) level = "MEDIUM";

  return {
    score: finalScore,
    level,
    reasons: rule.reasons,
  };
}

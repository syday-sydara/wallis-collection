/**
 * Public utility API for the entire application.
 * Only export stable, safe utilities from this file.
 */

// ----------------------
// Formatters
// ----------------------
export { formatCurrency } from "./formatters/currency";
export { formatDate } from "./formatters/date";
export { normalizePhoneForWhatsApp } from "./formatters/phone";
export { PhoneNumber } from "./formatters/phone-number";

// ----------------------
// Risk Scoring
// ----------------------
export { calculateCategoryRiskScore } from "./formatters/riskScore";
export { RiskEngine } from "./formatters/riskEngine";
export { RiskService } from "../services/RiskService";

// Built‑in Risk Plugins
export { PaymentRiskPlugin } from "./formatters/plugins/paymentRisk";
export { DeviceRiskPlugin } from "./formatters/plugins/deviceRisk";
export { BehaviorRiskPlugin } from "./formatters/plugins/behaviorRisk";
export { AddressRiskPlugin } from "./formatters/plugins/addressRisk";

// ----------------------
// Utilities
// ----------------------
export { sleep } from "./sleep";
export { cn } from "./tailwind";

// ----------------------
// Messaging (server-only)
// ----------------------
export { generateWhatsAppMessage, generateWhatsAppLink } from "./whatsapp";

/**
 * Public utility API for the entire application.
 * Only export stable, safe utilities from this file.
 */

// Formatters
export { formatCurrency } from "./formatters/currency";
export { formatDate } from "./formatters/date";
export { normalizePhoneForWhatsApp } from "./formatters/phone";
export { calculateCategoryRiskScore } from "./formatters/riskScore";

// Utilities
export { sleep } from "./sleep";
export { cn } from "./tailwind";

// Messaging (server-only)
export { generateWhatsAppMessage, generateWhatsAppLink } from "./whatsapp";
// If you added it:
// export { sendWhatsAppOrder } from "./messaging/sendWhatsAppOrder";

/**
 * Public utility API for the entire application.
 * Only export stable, pure, domain‑agnostic utilities from this file.
 */

/* ----------------------------------------
 * Formatters
 * -------------------------------------- */
export { formatCurrency, formatNGN } from "./formatters/currency";
export {
  formatDate,
  formatDateOnly,
  formatDateShort,
  formatTime,
  parseDate,
} from "./formatters/date";
export { normalizePhoneForWhatsApp } from "./formatters/phone";
export { PhoneNumber } from "./formatters/phone-number";

/* ----------------------------------------
 * Generic Utilities
 * -------------------------------------- */
export { sleep, delay, isSleepAbortedError } from "./sleep";
export { cn } from "./tailwind";

/* ----------------------------------------
 * Messaging Helpers (server-only)
 * -------------------------------------- */
export {
  generateWhatsAppMessage,
  generateWhatsAppLink,
} from "./whatsapp";

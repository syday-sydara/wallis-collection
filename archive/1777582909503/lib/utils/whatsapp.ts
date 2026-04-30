// lib/utils/whatsapp.ts

/**
 * Encode a WhatsApp message safely for use in URLs.
 *
 * @param message - The message to encode
 */
export function generateWhatsAppMessage(message: string): string {
  return encodeURIComponent(message);
}

/**
 * Normalize a phone number for WhatsApp deep links.
 * Removes spaces, dashes, parentheses, and leading "+".
 *
 * @param phone - Raw phone number
 */
export function normalizeWhatsAppPhone(phone: string): string {
  return phone.replace(/[^\d]/g, "");
}

/**
 * Generate a WhatsApp deep link.
 *
 * @param phone - Phone number (any format)
 * @param message - Optional message to prefill
 *
 * @example
 * generateWhatsAppLink("+234 801 234 5678", "Hello!")
 * // → "https://wa.me/2348012345678?text=Hello%21"
 */
export function generateWhatsAppLink(phone: string, message?: string): string {
  const normalized = normalizeWhatsAppPhone(phone);
  const base = `https://wa.me/${normalized}`;

  if (!message) return base;

  const encoded = generateWhatsAppMessage(message);
  return `${base}?text=${encoded}`;
}

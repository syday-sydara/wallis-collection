// lib/utils/whatsapp.ts
import type { CartItem } from "../cart/types";
import { formatCurrency } from "./formatters/currency";
import { normalizePhoneForWhatsApp } from "./formatters/phone";

function sanitizeText(text: string): string {
  return text.normalize("NFC").trim();
}

function formatCartLine(item: CartItem): string {
  const attrs = item.attributes
    ? Object.entries(item.attributes)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([, v]) => sanitizeText(String(v)))
        .join(", ")
    : "";

  const variant = attrs ? ` (${attrs})` : "";
  const total = item.unitPrice * item.quantity;

  return `${sanitizeText(item.name)}${variant} x${item.quantity} - ${formatCurrency(
    total,
    false
  )}`;
}

export function generateWhatsAppMessage(
  items: CartItem[],
  total: number,
  fullName?: string
) {
  const name = fullName?.trim()
    ? `Hello! My name is ${sanitizeText(fullName)}.\n`
    : "Hello!\n";

  const lines = items.map(formatCartLine).join("\n");

  return (
    `${name}I would like to place an order:\n\n` +
    lines +
    `\n\nTotal: ${formatCurrency(total, false)}`
  ).trim();
}

export function generateWhatsAppLink(message: string) {
  const rawPhone =
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "234XXXXXXXXXX";

  const phone = normalizePhoneForWhatsApp(rawPhone) ?? "234XXXXXXXXXX";
  const encoded = encodeURIComponent(sanitizeText(message));

  return `https://wa.me/${phone}?text=${encoded}`;
}

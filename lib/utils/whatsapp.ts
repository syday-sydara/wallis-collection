// lib/utils/whatsapp.ts
import type { CartItem } from "@/app/(store)/checkout/page";

/**
 * Format a single cart line for WhatsApp.
 */
function formatCartLine(item: CartItem): string {
  const variant = item.variant ? ` (${item.variant})` : "";
  const lineTotal = item.unitPrice * item.quantity;

  return `${item.name}${variant} x${item.quantity} - ₦${lineTotal.toLocaleString()}`;
}

/**
 * Generate a WhatsApp message based on cart items, total, and buyer name.
 */
export function generateWhatsAppMessage(
  items: CartItem[],
  total: number,
  fullName?: string
): string {
  const itemLines = items.map(formatCartLine).join("\n");

  const nameLine = fullName?.trim()
    ? `Hello! My name is ${fullName.trim()}.\n`
    : "Hello!\n";

  return (
    `${nameLine}I would like to place an order:\n\n` +
    `${itemLines}\n\n` +
    `Total: ₦${total.toLocaleString()}`
  );
}

/**
 * Generate a WhatsApp URL with a prefilled message.
 * Uses your business number from env or fallback.
 */
export function generateWhatsAppLink(message: string): string {
  const phone =
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "234XXXXXXXXXX"; // fallback

  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

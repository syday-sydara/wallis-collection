// lib/utils/whatsapp.ts
import type { CartItem } from "@/lib/cart/types";

function formatCartLine(item: CartItem): string {
  const variant = item.attributes
    ? ` (${Object.values(item.attributes).join(", ")})`
    : "";

  const total = item.unitPrice * item.quantity;

  return `${item.name}${variant} x${item.quantity} - ₦${total.toLocaleString()}`;
}

export function generateWhatsAppMessage(
  items: CartItem[],
  total: number,
  fullName?: string
) {
  const name = fullName?.trim()
    ? `Hello! My name is ${fullName}.\n`
    : "Hello!\n";

  return (
    `${name}I would like to place an order:\n\n` +
    items.map(formatCartLine).join("\n") +
    `\n\nTotal: ₦${total.toLocaleString()}`
  );
}

export function generateWhatsAppLink(message: string) {
  const phone =
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "234XXXXXXXXXX";

  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}
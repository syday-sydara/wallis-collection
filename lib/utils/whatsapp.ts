// lib/utils/whatsapp.ts

import type { CartItem } from "@/app/(store)/checkout/page";

/**
 * Generate a WhatsApp message based on cart items, total, and buyer name
 */
export function generateWhatsAppMessage(
  items: CartItem[],
  total: number,
  fullName?: string
) {
  const itemLines = items
    .map(
      (i) =>
        `${i.name}${i.variant ? ` (${i.variant})` : ""} x${i.quantity} - ₦${(
          i.unitPrice * i.quantity
        ).toLocaleString()}`
    )
    .join("\n");

  const message = `Hello! My name is ${fullName || ""}.\nI would like to place an order:\n\n${itemLines}\n\nTotal: ₦${total.toLocaleString()}`;
  return message;
}

/**
 * Generate a WhatsApp URL with prefilled message for Nigeria
 */
export function generateWhatsAppLink(message: string) {
  const phone = "234XXXXXXXXXX"; // replace with your business number
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}
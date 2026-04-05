"use client";

import { useCart } from "@/lib/cart/store";
import { formatCurrency } from "@/lib/utils/formatters/currency";

export function WhatsAppFAB() {
  const { items, subtotal } = useCart();

  if (items.length === 0) return null;

  const messageLines = [
    "Hello! I want to place an order:",
    "",
    ...items.map(
      (i) => `${i.name} x${i.quantity} = ${formatCurrency(i.unitPrice * i.quantity)}`
    ),
    "",
    `Total: ${formatCurrency(subtotal)}`
  ];

  const link = `https://wa.me/?text=${encodeURIComponent(messageLines.join("\n"))}`;

  return (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      className="whatsapp-fab fixed bottom-6 right-6 bg-green-500 text-white px-4 py-3 rounded-full shadow-lg flex items-center gap-2 active:scale-95 transition"
    >
      <span>💬</span>
      <span className="font-medium">Checkout via WhatsApp</span>
    </a>
  );
}
"use client";
import { useCart } from "@/lib/cart/store";
import { formatCurrency } from "@/lib/utils/formatters/currency";

export function WhatsAppFAB() {
  const { items, subtotal } = useCart();

  if (items.length === 0) return null;

  const message = `Hello! I want to place an order:\n` +
    items.map(i => `${i.name} x${i.quantity} = ${formatCurrency(i.unitPrice * i.quantity)}`).join("\n") +
    `\nTotal: ${formatCurrency(subtotal)}`;

  const link = `https://wa.me/?text=${encodeURIComponent(message)}`;

  return (
    <a href={link} target="_blank" rel="noopener noreferrer"
      className="whatsapp-fab">
      <span>💬</span>
      <span>Checkout via WhatsApp</span>
    </a>
  );
}
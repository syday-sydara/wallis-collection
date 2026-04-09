"use client";

import { useCart } from "@/lib/cart/store";
import { formatCurrency } from "@/lib/utils/formatters/currency";
import Image from "next/image";

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
    `Total: ${formatCurrency(subtotal)}`,
  ];

  const link = `https://wa.me/?text=${encodeURIComponent(
    messageLines.join("\n")
  )}`;

  return (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      className="whatsapp-fab fixed bottom-6 right-6 bg-green-500 text-white px-4 py-3 rounded-full shadow-lg flex items-center gap-2 active:scale-95 transition"
    >
      <span>💬</span>
      <span className="font-medium">Checkout via WhatsApp</span>

      {/* Optional: Show small thumbnails for items */}
      <div className="flex -space-x-2">
        {items.slice(0, 3).map((item) => (
          <div key={item.id} className="relative w-6 h-6 rounded-full overflow-hidden border-2 border-white">
            <Image
              src={item.image}
              alt={item.name}
              fill
              className="object-cover"
              sizes="24px"
            />
          </div>
        ))}
        {items.length > 3 && (
          <div className="w-6 h-6 flex items-center justify-center text-xs font-bold bg-white text-green-500 rounded-full border-2 border-white">
            +{items.length - 3}
          </div>
        )}
      </div>
    </a>
  );
}
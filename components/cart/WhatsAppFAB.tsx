"use client";

import { useEffect, useState } from "react";
import { useCart } from "@/lib/cart/store";
import { formatCurrency } from "@/lib/utils/formatters/currency";
import Image from "next/image";
import { MessageCircle } from "lucide-react";

export function WhatsAppFAB() {
  const { items, subtotal } = useCart();
  const [loading, setLoading] = useState(false);
  const [pulse, setPulse] = useState(false);

  if (items.length === 0) return null;

  /* ---------------------------------------------
   * Trigger pulse animation when cart updates
   * --------------------------------------------- */
  useEffect(() => {
    if (items.length === 0) return;

    setPulse(true);
    const t = setTimeout(() => setPulse(false), 1500);

    return () => clearTimeout(t);
  }, [items.length, subtotal]);

  /* ---------------------------------------------
   * WhatsApp Checkout
   * --------------------------------------------- */
  async function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    if (loading) return;

    setLoading(true);

    try {
      const res = await fetch("/api/checkout/whatsapp", {
        method: "POST",
        body: JSON.stringify({ items }),
      });

      const data = await res.json();

      if (data.url) {
        // Track analytics
        for (const item of items) {
          fetch("/api/insights", {
            method: "POST",
            body: JSON.stringify({
              productId: item.productId,
              type: "whatsapp_click",
              variantId: item.variantId,
            }),
          });
        }

        window.location.href = data.url;
      }
    } catch (err) {
      console.error("WhatsApp FAB checkout failed:", err);
    }

    setLoading(false);
  }

  return (
    <button
      onClick={handleClick}
      className={`
        fixed bottom-6 right-6 bg-green-500 text-white px-4 py-3 rounded-full 
        shadow-xl flex items-center gap-3 active:scale-95 transition-all
        ${pulse ? "animate-fab-pulse" : ""}
      `}
    >
      <MessageCircle className="h-5 w-5" />

      <div className="flex flex-col items-start leading-tight">
        <span className="font-semibold text-sm">
          {loading ? "Opening WhatsApp..." : "Checkout via WhatsApp"}
        </span>
        <span className="text-xs opacity-90">
          {formatCurrency(subtotal)} • {items.length} item{items.length > 1 ? "s" : ""}
        </span>
      </div>

      <div className="flex -space-x-2 ml-1">
        {items.slice(0, 3).map((item) => (
          <div
            key={item.id}
            className="relative w-6 h-6 rounded-full overflow-hidden border-2 border-white"
          >
            <Image
              src={item.image ?? "/placeholder.png"}
              alt={item.name}
              fill
              className="object-cover"
              sizes="24px"
            />
          </div>
        ))}

        {items.length > 3 && (
          <div className="w-6 h-6 flex items-center justify-center text-xs font-bold bg-white text-green-600 rounded-full border-2 border-white">
            +{items.length - 3}
          </div>
        )}
      </div>
    </button>
  );
}

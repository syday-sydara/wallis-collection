"use client";

import { CartItem } from "@/lib/types/types";
import { useCart } from "./CartProvider";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useState } from "react";
import { X } from "lucide-react";

interface CartItemRowProps {
  item: CartItem;
  variant?: "compact" | "full";
}

export default function CartItemRow({ item, variant = "compact" }: CartItemRowProps) {
  const { increment, decrement, removeItem } = useCart();
  const [isRemoving, setIsRemoving] = useState(false);

  const isFull = variant === "full";

  const handleRemove = () => {
    setIsRemoving(true);
    // Matches the exit animation duration
    setTimeout(() => removeItem(item.key), 200);
  };

  return (
    <AnimatePresence>
      {!isRemoving && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className={`flex items-center gap-4 ${
            isFull 
              ? "p-4 border border-[var(--color-border)] rounded-lg" 
              : "py-4 border-b border-[var(--color-border)]"
          }`}
        >
          {/* Product Image */}
          <div className="flex-shrink-0 w-20 h-20 relative rounded-md overflow-hidden bg-[var(--color-bg-surface)]">
            <Image
              src={item.image || "/placeholder.png"}
              alt={item.name}
              fill
              className="object-cover"
              sizes="80px"
            />
          </div>

          {/* Product Info */}
          <div className="flex-1 min-w-0">
            <h3 className={`font-medium truncate ${isFull ? "text-base" : "text-sm"}`}>
              {item.name}
            </h3>
            
            {item.variants && Object.keys(item.variants).length > 0 && (
              <p className="text-xs text-[var(--color-text-secondary)] truncate">
                {Object.entries(item.variants)
                  .map(([k, v]) => `${k}: ${v}`)
                  .join(isFull ? ", " : " • ")}
              </p>
            )}
            
            <p className={`mt-1 font-semibold text-[var(--color-text-primary)] ${isFull ? "text-base" : "text-sm"}`}>
              ₦{item.price.toLocaleString()}
            </p>
          </div>

          {/* Quantity Controls */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => decrement(item.key)}
              aria-label="Decrease quantity"
              className="px-2 py-1 border border-[var(--color-border)] rounded-md text-sm hover:bg-[var(--color-bg-surface)] transition"
            >
              −
            </button>
            <motion.span
              key={item.quantity}
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="text-sm w-6 text-center font-medium"
            >
              {item.quantity}
            </motion.span>
            <button
              onClick={() => increment(item.key)}
              aria-label="Increase quantity"
              className="px-2 py-1 border border-[var(--color-border)] rounded-md text-sm hover:bg-[var(--color-bg-surface)] transition"
            >
              +
            </button>
          </div>

          {/* Remove Button */}
          <button
            onClick={handleRemove}
            className="ml-2 text-[var(--color-danger-500)] hover:opacity-70 transition-opacity"
            aria-label={`Remove ${item.name}`}
          >
            {isFull ? <X size={20} /> : <span className="text-sm">Remove</span>}
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
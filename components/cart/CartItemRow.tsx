"use client";

import { CartItem, useCart } from "./CartProvider";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useState } from "react";

interface CartItemRowProps {
  item: CartItem;
}

export default function CartItemRow({ item }: CartItemRowProps) {
  const { increment, decrement, removeItem } = useCart();
  const [isRemoving, setIsRemoving] = useState(false);

  const handleRemove = () => {
    setIsRemoving(true);
    setTimeout(() => removeItem(item.key), 200);
  };

  return (
    <AnimatePresence>
      {!isRemoving && (
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 50 }}
          transition={{ duration: 0.2 }}
          className="flex items-center space-x-4 py-4 border-b border-[var(--color-border)]"
        >
          <div className="flex-shrink-0 w-20 h-20 relative rounded-md overflow-hidden">
            <Image
              src={item.image || "/placeholder.png"}
              alt={item.name}
              fill
              className="object-cover"
              sizes="80px"
            />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-sm truncate">{item.name}</h3>
            {item.variants && (
              <p className="text-xs text-[var(--color-text-secondary)] truncate">
                {Object.entries(item.variants)
                  .map(([k, v]) => `${k}: ${v}`)
                  .join(" • ")}
              </p>
            )}
            <p className="mt-1 text-sm font-semibold text-[var(--color-text-primary)]">
              ₦{item.price.toLocaleString()}
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => decrement(item.key)}
              className="px-2 py-1 border rounded-md text-sm hover:bg-[var(--color-accent-500)] hover:text-white transition"
            >
              −
            </button>
            <motion.span
              key={item.quantity}
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.15 }}
              className="text-sm w-6 text-center"
            >
              {item.quantity}
            </motion.span>
            <button
              onClick={() => increment(item.key)}
              className="px-2 py-1 border rounded-md text-sm hover:bg-[var(--color-accent-500)] hover:text-white transition"
            >
              +
            </button>
          </div>

          <button
            onClick={handleRemove}
            className="ml-4 text-[var(--color-danger-500)] hover:text-red-700 transition text-sm"
          >
            Remove
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
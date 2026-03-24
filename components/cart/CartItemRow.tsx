"use client";

import { CartItem, useCart } from "./cart-context";
import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

interface CartItemRowProps { item: CartItem }

export default function CartItemRow({ item }: CartItemRowProps) {
  const { increment, decrement, removeItem } = useCart();
  const [isRemoving, setIsRemoving] = useState(false);

  const handleRemove = useCallback(() => {
    setIsRemoving(true);
    setTimeout(() => removeItem(item.key), 200);
  }, [item.key, removeItem]);

  return (
    <AnimatePresence>
      {!isRemoving && (
        <motion.div
          layout
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 30 }}
          transition={{ duration: 0.2 }}
          className="flex items-center space-x-4 py-3 border-b border-border"
        >
          <div className="flex-shrink-0 w-20 h-20 relative rounded-md overflow-hidden">
            <Image src={item.image || "/placeholder.png"} alt={item.name} fill className="object-cover" sizes="80px" />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-sm truncate">{item.name}</h3>
            {item.variants && (
              <p className="text-xs text-text-secondary truncate">
                {Object.entries(item.variants).map(([k,v]) => `${k}: ${v}`).join(" • ")}
              </p>
            )}
            <p className="mt-1 text-sm font-semibold text-text-primary">₦{item.price.toLocaleString()}</p>
          </div>

          <div className="flex items-center space-x-2">
            <button onClick={() => decrement(item.key)} aria-label={`Decrease quantity of ${item.name}`} className="px-2 py-1 border border-border rounded-md text-sm hover:bg-accent-500 hover:text-white transition focus:outline-none focus:ring-2 focus:ring-accent-500">−</button>
            <motion.span key={item.quantity} layout initial={{ scale: 0.8 }} animate={{ scale: 1 }} transition={{ duration: 0.15 }} className="text-sm w-6 text-center">{item.quantity}</motion.span>
            <button onClick={() => increment(item.key)} aria-label={`Increase quantity of ${item.name}`} className="px-2 py-1 border border-border rounded-md text-sm hover:bg-accent-500 hover:text-white transition focus:outline-none focus:ring-2 focus:ring-accent-500">+</button>
          </div>

          <button onClick={handleRemove} aria-label={`Remove ${item.name} from cart`} className="ml-4 text-danger-500 hover:text-red-700 transition text-sm focus:outline-none focus:ring-2 focus:ring-danger-500 rounded">Remove</button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
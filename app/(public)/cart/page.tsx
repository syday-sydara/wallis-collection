"use client";

import { useCart } from "@/components/cart/CartProvider";
import { formatPrice } from "@/lib/formatters";
import { useState } from "react";

export default function CartPage() {
  const { items, increment, decrement, removeItem, clearCart, total, isEmpty } = useCart();
  const [variantSelection, setVariantSelection] = useState<Record<string, Record<string, string>>>({});

  if (isEmpty) return <p className="p-4 text-center">Your cart is empty.</p>;

  const handleVariantChange = (itemKey: string, variantName: string, value: string) => {
    setVariantSelection((prev) => ({
      ...prev,
      [itemKey]: { ...prev[itemKey], [variantName]: value },
    }));
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Shopping Cart</h1>
      <div className="space-y-4">
        {items.map((item) => {
          const stockLimit = item.stock ?? Infinity;
          const selectedVariants = variantSelection[item.key] || item.variants || {};
          const isOverStock = item.quantity > stockLimit;

          return (
            <div
              key={item.key}
              className="flex items-center justify-between border p-4 rounded-md"
            >
              <div className="flex items-center gap-4">
                <img
                  src={item.image || "/fallback-product.jpg"}
                  alt={item.name}
                  className="w-20 h-20 object-cover rounded"
                />
                <div>
                  <h2 className="font-semibold">{item.name}</h2>
                  <p className="text-sm text-gray-600">{formatPrice(item.price)}</p>
                  {item.variants && (
                    <div className="flex gap-2 mt-1">
                      {Object.keys(item.variants).map((variantName) => (
                        <select
                          key={variantName}
                          value={selectedVariants[variantName] || ""}
                          onChange={(e) =>
                            handleVariantChange(item.key, variantName, e.target.value)
                          }
                          className="border px-1 py-0.5 rounded text-sm"
                        >
                          <option value="">Select {variantName}</option>
                          <option value={item.variants![variantName]}>{item.variants![variantName]}</option>
                        </select>
                      ))}
                    </div>
                  )}
                  {isOverStock && (
                    <p className="text-red-500 text-sm mt-1">Stock insufficient!</p>
                  )}
                </div>
              </div>

              <div className="flex flex-col items-end gap-2">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => decrement(item.key)}
                    className="px-2 py-1 bg-gray-200 rounded"
                  >
                    -
                  </button>
                  <span>{item.quantity}</span>
                  <button
                    onClick={() => increment(item.key)}
                    disabled={item.quantity >= stockLimit}
                    className={`px-2 py-1 rounded ${
                      item.quantity >= stockLimit ? "bg-gray-300 cursor-not-allowed" : "bg-gray-200"
                    }`}
                  >
                    +
                  </button>
                </div>
                <button
                  onClick={() => removeItem(item.key)}
                  className="text-red-500 text-sm"
                >
                  Remove
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 flex justify-between items-center">
        <div className="text-lg font-semibold">
          Total: {formatPrice(total)}
        </div>
        <div className="flex gap-2">
          <button
            onClick={clearCart}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
          >
            Clear Cart
          </button>
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            disabled={items.some((i) => (i.stock ?? Infinity) < i.quantity)}
          >
            Checkout
          </button>
        </div>
      </div>
    </div>
  );
}
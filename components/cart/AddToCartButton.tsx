"use client";

import { useState } from "react";
import { Loader2, Check } from "lucide-react";
import { useCart } from "@/lib/cart/store";
import { cn } from "@/lib/utils";

type Variant = { id: string; price: number; attributes?: Record<string, any> };

type Props = {
  productId: string;
  name: string;
  image: string;
  variant?: Variant;
  requiresVariant?: boolean;
  disabled?: boolean;
  className?: string;
};

export default function AddToCartButton({
  productId,
  name,
  image,
  variant,
  requiresVariant = false,
  disabled,
  className,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [added, setAdded] = useState(false);
  const [variantError, setVariantError] = useState(false);
  const { addItem } = useCart();

  const isBlocked = requiresVariant && !variant;
  const isDisabled = disabled || loading || isBlocked;

  async function handleClick() {
    if (isDisabled) {
      if (isBlocked) {
        setVariantError(true);
        setTimeout(() => setVariantError(false), 1500);
      }
      return;
    }

    setLoading(true);

    // Haptic feedback
    if (navigator.vibrate) navigator.vibrate(10);

    addItem({
      name,
      productId,
      unitPrice: variant!.price, // safe because isBlocked prevents missing variant
      image: image ?? "/placeholder.png",
      attributes: variant?.attributes,
    });

    setLoading(false);
    setAdded(true);

    // Flash "Added!" briefly
    setTimeout(() => setAdded(false), 1200);
  }

  return (
    <div className="space-y-1">
      <button
        type="button"
        onClick={handleClick}
        disabled={isDisabled}
        aria-busy={loading}
        aria-live="polite"
        aria-label={
          loading
            ? "Adding to cart"
            : isBlocked
            ? "Select a variant first"
            : "Add to cart"
        }
        className={cn(
          "w-full rounded-md bg-primary py-3 font-medium text-primary-foreground",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          "hover:bg-primary-hover active:bg-primary-active active:scale-press",
          "transition-all animate-fadeIn-fast min-h-touch",
          className
        )}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Adding...
          </span>
        ) : added ? (
          <span className="flex items-center justify-center gap-2 text-green-200">
            <Check className="h-4 w-4" />
            Added!
          </span>
        ) : isBlocked ? (
          "Select Variant"
        ) : (
          "Add to Cart"
        )}
      </button>

      {variantError && (
        <p className="text-xs text-danger animate-fadeIn-fast">
          Please select a variant first
        </p>
      )}
    </div>
  );
}

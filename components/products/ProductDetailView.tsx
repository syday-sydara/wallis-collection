"use client";

import { useState } from "react";
import Image from "next/image";
import { useCart } from "@/components/cart/CartProvider";
import Button from "@/components/ui/Button";
import { getPrimaryImage, getCurrentPrice } from "@/lib/types/product";

export default function ProductDetailView({ product }: { product: any }) {
  const { addItem } = useCart();

  const [mainImage, setMainImage] = useState(
    getPrimaryImage(product.images)
  );

  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [showSizeError, setShowSizeError] = useState(false);

  const hasSizes = product.sizes && product.sizes.length > 0;
  const outOfStock = product.stock <= 0;

  const finalPrice = getCurrentPrice({
    price: product.price,
    salePrice: product.salePrice,
  });

  const handleAddToCart = () => {
    if (hasSizes && !selectedSize) {
      setShowSizeError(true);
      return;
    }

    addItem({
      id: product.id,
      name: product.name,
      price: finalPrice,
      image: mainImage,
      variants: { size: selectedSize || "Default" },
      key: `${product.id}-${selectedSize || "Default"}`,
    });

    window.dispatchEvent(new CustomEvent("open-cart"));
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
      {/* Gallery */}
      <div className="space-y-4">
        <div className="aspect-[3/4] relative overflow-hidden rounded-xl bg-[var(--color-bg-surface)]">
          <Image
            src={mainImage}
            alt={`${product.name} product image`}
            fill
            priority
            className="object-cover will-change-transform"
          />
        </div>

        <div className="flex gap-4 overflow-x-auto pb-2">
          {product.images.map((img: any) => (
            <button
              key={img.url}
              onClick={() => setMainImage(img.url)}
              className={clsx(
                "relative w-20 h-24 flex-shrink-0 rounded-md overflow-hidden border-2 transition",
                mainImage === img.url
                  ? "border-[var(--color-accent-500)]"
                  : "border-transparent hover:border-[var(--color-border)]"
              )}
            >
              <Image
                src={img.url}
                alt=""
                fill
                loading="lazy"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      </div>

      {/* Info */}
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="heading-1">{product.name}</h1>
          <p className="text-2xl font-semibold mt-2 text-[var(--color-accent-500)]">
            ₦{finalPrice.toLocaleString()}
          </p>
        </div>

        <div className="prose prose-sm text-[var(--color-text-secondary)]">
          {product.description}
        </div>

        {/* Size Selection */}
        {hasSizes && (
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium uppercase tracking-wider">
                Select Size
              </span>

              {showSizeError && (
                <span className="text-sm text-[var(--color-danger-500)] font-medium">
                  Please select a size
                </span>
              )}
            </div>

            <div
              className="flex gap-3"
              role="radiogroup"
              aria-label="Select size"
            >
              {product.sizes.map((size: string) => {
                const isSelected = selectedSize === size;

                return (
                  <button
                    key={size}
                    role="radio"
                    aria-checked={isSelected}
                    aria-label={`Select size ${size}`}
                    onClick={() => {
                      setSelectedSize(size);
                      setShowSizeError(false);
                    }}
                    className={clsx(
                      "px-4 py-2 text-sm border rounded-md transition-all",
                      isSelected
                        ? "bg-[var(--color-gray-900)] text-white border-[var(--color-gray-900)]"
                        : showSizeError
                        ? "border-[var(--color-danger-500)] bg-[var(--color-danger-500)]/10"
                        : "border-[var(--color-border)] hover:border-[var(--color-gray-900)]"
                    )}
                  >
                    {size}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <Button
          variant="primary"
          size="lg"
          className="w-full md:w-64"
          onClick={handleAddToCart}
          disabled={outOfStock}
          aria-label={
            outOfStock
              ? `${product.name} is out of stock`
              : `Add ${product.name} to cart`
          }
        >
          {outOfStock ? "Out of Stock" : "Add to Cart"}
        </Button>
      </div>
    </div>
  );
}

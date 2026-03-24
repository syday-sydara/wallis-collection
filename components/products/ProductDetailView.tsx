"use client";

import { useState } from "react";
import Image from "next/image";
import { useCart } from "@/components/cart/CartProvider";
import Button from "@/components/ui/Button";

export default function ProductDetailView({ product }: { product: any }) {
  const { addItem } = useCart();

  // 1. Start with null so the user MUST select a size
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [showSizeError, setShowSizeError] = useState(false);
  // ... (keep image state and price variables)
  const hasSizes = product.sizes && product.sizes.length > 0;

  const handleAddToCart = () => {
    // 2. Validate selection
    if (hasSizes && !selectedSize) {
      setShowSizeError(true);
      // Shake animation class could be added here
      return;
    }

    setShowSizeError(false);

    addItem({
      // ... (keep your existing addItem payload)
      variants: { size: selectedSize || "Default" },
      key: `${product.id}-${selectedSize || "Default"}`,
    });

    window.dispatchEvent(new CustomEvent("open-cart"));
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
      {/* Gallery */}
      <div className="space-y-4">
        <div className="aspect-[3/4] relative overflow-hidden rounded-xl bg-gray-100">
          <Image src={mainImage} alt={product.name} fill className="object-cover" priority />
        </div>
        <div className="flex gap-4 overflow-x-auto pb-2">
          {product.images.map((img: any) => (
            <button
              key={img.url}
              onClick={() => setMainImage(img.url)}
              className={`relative w-20 h-24 flex-shrink-0 rounded-md overflow-hidden border-2 ${mainImage === img.url ? 'border-accent-500' : 'border-transparent'}`}
            >
              <Image src={img.url} alt="" fill className="object-cover" />
            </button>
          ))}
        </div>
      </div>

      {/* Info */}
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="heading-1">{product.name}</h1>
          <p className="text-2xl font-semibold mt-2">₦{(product.salePrice || product.price).toLocaleString()}</p>
        </div>

        <div className="prose prose-sm text-text-secondary">
          {product.description}
        </div>

        {/* Size Selection */}
        {hasSizes && (
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium uppercase tracking-wider">Select Size</span>
              {/* 3. Show error message conditionally */}
              {showSizeError && (
                <span className="text-sm text-[var(--color-danger-500)] font-medium">
                  Please select a size
                </span>
              )}
            </div>
            
            <div className="flex gap-3">
              {product.sizes.map((size: string) => (
                <button
                  key={size}
                  onClick={() => {
                    setSelectedSize(size);
                    setShowSizeError(false); // Clear error on click
                  }}
                  className={`px-4 py-2 border text-sm transition-all ${
                    selectedSize === size 
                    ? "bg-gray-900 text-white border-gray-900" 
                    : showSizeError 
                      ? "border-[var(--color-danger-500)] bg-red-50" // Highlight missing selection
                      : "border-gray-200 hover:border-gray-900"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        )}

        <Button
          variant="primary"
          size="lg"
          className="w-full md:w-64"
          onClick={handleAddToCart}
          disabled={product.stock === 0}
        >
          {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
        </Button>
      </div>
    </div>
  );
}
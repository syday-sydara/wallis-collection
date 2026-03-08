// components/products/ProductCard.tsx
"use client";

import Button from "@/components/ui/Button";

interface ProductCardProps {
  id: string;
  name: string;
  slug: string;
  priceNaira: number;
  images: string[];
  isNew?: boolean;
  isOnSale?: boolean;
  outOfStock?: boolean;
  onAddToCart?: () => void;
}

export default function ProductCard({
  name,
  priceNaira,
  images,
  outOfStock = false,
  onAddToCart,
}: ProductCardProps) {
  return (
    <div className="card flex flex-col">
      <div className="relative w-full h-64 overflow-hidden rounded-lg">
        {images?.[0] && (
          <img
            src={images[0]}
            alt={name}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
        )}

        {outOfStock && (
          <span className="absolute top-2 left-2 bg-danger text-white text-xs px-2 py-1 rounded">
            Out of Stock
          </span>
        )}
      </div>

      <div className="mt-3 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-medium text-base">{name}</h3>
          <p className="mt-1 font-semibold text-primary">₦{priceNaira.toLocaleString()}</p>
        </div>

        <Button
          variant="primary"
          className="mt-3 w-full"
          onClick={onAddToCart}
          disabled={outOfStock}
        >
          {outOfStock ? "Unavailable" : "Add to Cart"}
        </Button>
      </div>
    </div>
  );
}
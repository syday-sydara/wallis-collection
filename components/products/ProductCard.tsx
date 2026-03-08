"use client";

import Image from "next/image";
import Button from "@/components/ui/Button";

export interface ProductCardProps {
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
  id,
  name,
  slug,
  priceNaira,
  images,
  isNew = false,
  isOnSale = false,
  outOfStock = false,
  onAddToCart,
}: ProductCardProps) {
  return (
    <div className="relative flex flex-col bg-surface rounded-lg shadow-card overflow-hidden group">
      <div className="absolute top-2 left-2 flex space-x-2 z-10">
        {isNew && <span className="bg-success text-white text-xs px-2 py-1 rounded-md">New</span>}
        {isOnSale && <span className="bg-warning text-white text-xs px-2 py-1 rounded-md">Sale</span>}
      </div>

      {outOfStock && (
        <div className="absolute inset-0 bg-black/40 z-20 flex items-center justify-center text-white font-semibold text-lg">
          Out of Stock
        </div>
      )}

      <div className="relative aspect-[3/4] w-full overflow-hidden bg-neutral-100">
        <Image
          src={images[0]}
          alt={name}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>

      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-semibold text-sm truncate">{name}</h3>
        <p className="mt-1 font-medium text-primary-500">₦{priceNaira.toLocaleString()}</p>
        <div className="mt-auto">
          <Button variant="primary" onClick={onAddToCart} disabled={outOfStock} className="w-full mt-3">
            Add to Cart
          </Button>
        </div>
      </div>
    </div>
  );
}
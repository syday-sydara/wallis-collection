"use client";

import Image from "next/image";
import Link from "next/link";
import Button from "@/components/ui/Button";

export interface ProductCardProps {
  id: string;
  name: string;
  slug: string;
  priceNaira: number;
  salePriceNaira?: number;
  images: { url: string }[];
  isNew?: boolean;
  isOnSale?: boolean;
  stock?: number;
  onAddToCart?: () => void;
}

export default function ProductCard({
  id,
  name,
  slug,
  priceNaira,
  salePriceNaira,
  images,
  isNew = false,
  isOnSale = false,
  stock = 0,
  onAddToCart,
}: ProductCardProps) {
  const outOfStock = stock <= 0;

  const displayImage =
    images[0]?.url ?? `https://picsum.photos/600/800?random=${id}`;

  const price = salePriceNaira || priceNaira;

  return (
    <div className="relative flex flex-col bg-[var(--color-bg-surface)] rounded-lg shadow-card overflow-hidden group">
      {/* Badges */}
      <div className="absolute top-2 left-2 flex space-x-2 z-10">
        {isNew && (
          <span className="bg-[var(--color-success-500)] text-white text-xs px-2 py-1 rounded-md">
            New
          </span>
        )}
        {isOnSale && (
          <span className="bg-[var(--color-warning-500)] text-white text-xs px-2 py-1 rounded-md">
            Sale
          </span>
        )}
      </div>

      {/* Out of Stock Overlay */}
      {outOfStock && (
        <div className="absolute inset-0 bg-black/40 z-20 flex items-center justify-center text-white font-semibold text-lg">
          Out of Stock
        </div>
      )}

      {/* Product Image */}
      <Link href={`/products/${slug}`} className="relative aspect-[3/4] w-full overflow-hidden bg-neutral-100">
        <Image
          src={displayImage}
          alt={name}
          fill
          sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </Link>

      {/* Product Info */}
      <div className="p-4 flex flex-col flex-1">
        <Link href={`/products/${slug}`}>
          <h3 className="font-semibold text-sm truncate hover:underline">
            {name}
          </h3>
        </Link>

        <div className="mt-1 flex items-center space-x-2">
          {isOnSale && salePriceNaira ? (
            <>
              <p className="font-semibold text-[var(--color-primary-500)]">
                ₦{salePriceNaira.toLocaleString()}
              </p>
              <p className="text-xs line-through text-neutral-500">
                ₦{priceNaira.toLocaleString()}
              </p>
            </>
          ) : (
            <p className="font-medium text-[var(--color-primary-500)]">
              ₦{price.toLocaleString()}
            </p>
          )}
        </div>

        {/* Stock Info */}
        {stock > 0 && (
          <p className="text-xs text-gray-500 mt-1">
            {outOfStock ? "Out of Stock" : `Only ${stock} left`}
          </p>
        )}

        <div className="mt-auto">
          <Button
            variant="primary"
            onClick={onAddToCart}
            disabled={outOfStock}
            className="w-full mt-3"
          >
            Add to Cart
          </Button>
        </div>
      </div>
    </div>
  );
}

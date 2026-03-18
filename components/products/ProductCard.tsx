"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import Button from "@/components/ui/Button";

export interface ProductCardProps {
  id: string;
  name: string;
  slug: string;
  priceNaira: number;
  salePriceNaira?: number;
  images?: { url: string }[];
  isNew?: boolean;
  isOnSale?: boolean;
  stock?: number;
  onAddToCart?: () => void;
}

const CURRENCY = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0,
});

export default function ProductCard({
  id,
  name,
  slug,
  priceNaira,
  salePriceNaira,
  images = [],
  isNew = false,
  isOnSale = false,
  stock = 0,
  onAddToCart,
}: ProductCardProps) {
  const outOfStock = stock <= 0;

  const imageUrl =
    images[0]?.url ??
    `https://picsum.photos/800/1067?random=${encodeURIComponent(id)}`;

  const discounted = isOnSale && salePriceNaira;
  const currentPrice = discounted ? salePriceNaira! : priceNaira;

  const stockMessage = outOfStock
    ? "Out of stock"
    : stock <= 10
    ? `Only ${stock} left`
    : "In stock";

  const encodedSlug = encodeURIComponent(slug);

  const handleAdd = () => {
    if (!outOfStock) onAddToCart?.();
  };

  return (
    <article
      aria-labelledby={`product-title-${id}`}
      aria-describedby={`product-price-${id} product-stock-${id}`}
      className="relative flex flex-col rounded-lg bg-[var(--color-bg-surface)] shadow-card overflow-hidden group transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
      data-product-id={id}
    >
      {/* Badges */}
      <div className="absolute top-2 left-2 z-10 flex gap-2">
        {isNew && (
          <span className="px-2 py-1 text-xs rounded-md bg-[var(--color-success-500)] text-white shadow-sm">
            New
          </span>
        )}
        {discounted && (
          <span className="px-2 py-1 text-xs rounded-md bg-[var(--color-warning-500)] text-white shadow-sm">
            Sale
          </span>
        )}
      </div>

      {/* Out of stock overlay */}
      {outOfStock && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/40 text-white text-lg font-semibold">
          Out of stock
        </div>
      )}

      {/* Image */}
      <Link
        href={`/products/${encodedSlug}`}
        className="relative w-full overflow-hidden bg-neutral-100"
        prefetch={false}
      >
        <div className="relative aspect-[3/4]">
          <Image
            src={imageUrl}
            alt={name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-300 ease-out group-hover:scale-105"
          />
        </div>
      </Link>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4">
        <header>
          <Link href={`/products/${encodedSlug}`}>
            <h3
              id={`product-title-${id}`}
              className="text-sm font-semibold truncate hover:underline"
            >
              {name}
            </h3>
          </Link>
        </header>

        {/* Price */}
        <section
          id={`product-price-${id}`}
          className="mt-2 flex items-baseline gap-2"
        >
          <p className="font-semibold text-[var(--color-primary-500)]">
            {CURRENCY.format(currentPrice)}
          </p>

          {discounted && (
            <p className="text-xs line-through text-neutral-500">
              {CURRENCY.format(priceNaira)}
            </p>
          )}
        </section>

        {/* Stock */}
        <p
          id={`product-stock-${id}`}
          className="mt-1 text-xs text-[var(--color-text-muted)]"
        >
          {stockMessage}
        </p>

        {/* Add to cart */}
        <footer className="mt-auto">
          <Button
            variant="primary"
            onClick={handleAdd}
            disabled={outOfStock}
            aria-disabled={outOfStock}
            aria-label={
              outOfStock ? "Out of stock" : `Add ${name} to cart`
            }
            className="w-full mt-3"
          >
            Add to cart
          </Button>
        </footer>
      </div>
    </article>
  );
}
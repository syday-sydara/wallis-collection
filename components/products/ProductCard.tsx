"use client";

import React, { useMemo } from "react";
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

  const displayImage = useMemo(() => {
    return (
      images[0]?.url ??
      `https://picsum.photos/800/1067?random=${encodeURIComponent(id)}`
    );
  }, [images, id]);

  const price = useMemo(() => {
    const discounted = Boolean(isOnSale && salePriceNaira);
    return {
      current: discounted ? salePriceNaira! : priceNaira,
      original: priceNaira,
      discounted,
    };
  }, [priceNaira, salePriceNaira, isOnSale]);

  const stockMessage = useMemo(() => {
    if (outOfStock) return "Out of stock";
    if (stock <= 10) return `Only ${stock} left`;
    return "In stock";
  }, [stock, outOfStock]);

  const handleAdd = () => {
    if (!outOfStock) onAddToCart?.();
  };

  return (
    <article
      aria-labelledby={`product-title-${id}`}
      aria-describedby={`product-price-${id} product-stock-${id}`}
      className="relative flex flex-col bg-[var(--color-bg-surface)] rounded-lg shadow-card overflow-hidden group"
      data-product-id={id}
    >
      <div className="absolute top-2 left-2 flex space-x-2 z-10 pointer-events-none">
        {isNew && (
          <span className="inline-flex items-center bg-[var(--color-success-500)] text-white text-xs px-2 py-1 rounded-md pointer-events-auto">
            New
          </span>
        )}
        {price.discounted && (
          <span className="inline-flex items-center bg-[var(--color-warning-500)] text-white text-xs px-2 py-1 rounded-md pointer-events-auto">
            Sale
          </span>
        )}
      </div>

      {outOfStock && (
        <div className="absolute inset-0 bg-black/40 z-20 flex items-center justify-center text-white font-semibold text-lg">
          Out of stock
        </div>
      )}

      <Link
        href={`/products/${encodeURIComponent(slug)}`}
        className="relative w-full overflow-hidden bg-neutral-100"
        prefetch={false}
      >
        <div className="w-full aspect-[3/4] relative">
          <Image
            src={displayImage}
            alt={name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      </Link>

      <div className="p-4 flex flex-col flex-1">
        <header>
          <Link href={`/products/${encodeURIComponent(slug)}`} className="no-underline">
            <h3
              id={`product-title-${id}`}
              className="font-semibold text-sm truncate hover:underline"
            >
              {name}
            </h3>
          </Link>
        </header>

        <section
          id={`product-price-${id}`}
          className="mt-2 flex items-baseline space-x-2"
        >
          {price.discounted ? (
            <>
              <p className="font-semibold text-[var(--color-primary-500)]">
                {CURRENCY.format(price.current)}
              </p>
              <p className="text-xs line-through text-neutral-500">
                {CURRENCY.format(price.original)}
              </p>
            </>
          ) : (
            <p className="font-medium text-[var(--color-primary-500)]">
              {CURRENCY.format(price.current)}
            </p>
          )}
        </section>

        <p
          id={`product-stock-${id}`}
          className="text-xs text-gray-500 mt-1"
        >
          {stockMessage}
        </p>

        <footer className="mt-auto">
          <Button
            variant="primary"
            onClick={handleAdd}
            disabled={outOfStock}
            aria-label={outOfStock ? "Out of stock" : `Add ${name} to cart`}
            className="w-full mt-3"
          >
            Add to cart
          </Button>
        </footer>
      </div>
    </article>
  );
}
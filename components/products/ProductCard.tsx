"use client";

import Image from "next/image";
import Link from "next/link";
import Button from "@/components/ui/Button";
import {
  ProductCard as ProductCardType,
  getCurrentPrice,
  getPrimaryImage,
} from "@/lib/types/product";

interface Props extends ProductCardType {
  onAddToCart?: () => void;
}

export default function ProductCard({
  id,
  name,
  slug,
  price,
  salePrice,
  images,
  stock = 0,
  isNew,
  isOnSale,
  onAddToCart,
}: Props) {
  const finalPrice = getCurrentPrice({ price, salePrice });
  const imageUrl = getPrimaryImage(images);
  const outOfStock = stock <= 0;

  return (
    <article
      className="
        relative flex flex-col rounded-lg bg-[var(--color-bg-surface)]
        shadow-card overflow-hidden group transition-all
        hover:-translate-y-1 hover:shadow-soft
      "
      data-product-id={id}
      data-out-of-stock={outOfStock}
      data-on-sale={isOnSale}
    >
      {/* Badges */}
      <div className="absolute top-2 left-2 flex gap-2 z-10">
        {isNew && (
          <span className="px-2 py-1 text-xs rounded-md bg-[var(--color-success-500)] text-white">
            New
          </span>
        )}
        {isOnSale && (
          <span className="px-2 py-1 text-xs rounded-md bg-[var(--color-accent-500)] text-white">
            Sale
          </span>
        )}
        {outOfStock && (
          <span className="px-2 py-1 text-xs rounded-md bg-[var(--color-danger-500)] text-white">
            Out of Stock
          </span>
        )}
      </div>

      {/* Image */}
      <Link
        href={`/products/${encodeURIComponent(slug)}`}
        className="relative w-full aspect-[3/4] overflow-hidden bg-[var(--color-bg-surface)]"
      >
        <Image
          src={imageUrl}
          alt={`${name} product image`}
          fill
          loading="lazy"
          sizes="(max-width: 768px) 50vw, 25vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105 will-change-transform"
        />
      </Link>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4">
        <h3 className="text-sm font-semibold truncate text-[var(--color-text-primary)]">
          {name}
        </h3>

        <p className="mt-2 font-semibold text-[var(--color-accent-500)]">
          {finalPrice.toLocaleString("en-NG", {
            style: "currency",
            currency: "NGN",
            maximumFractionDigits: 0,
          })}
        </p>

        <Button
          onClick={onAddToCart}
          disabled={outOfStock}
          className="w-full mt-3"
          aria-label={outOfStock ? `${name} is out of stock` : `Add ${name} to cart`}
        >
          {outOfStock ? "Out of Stock" : "Add to Cart"}
        </Button>
      </div>
    </article>
  );
}

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
        relative flex flex-col rounded-lg bg-bg-surface shadow-card overflow-hidden
        group transition-all hover:-translate-y-1 hover:shadow-lg
      "
    >
      {/* Badges */}
      <div className="absolute top-2 left-2 flex gap-2 z-10">
        {isNew && (
          <span className="px-2 py-1 text-xs rounded-md bg-success-500 text-white">
            New
          </span>
        )}
        {isOnSale && (
          <span className="px-2 py-1 text-xs rounded-md bg-accent-500 text-white">
            Sale
          </span>
        )}
        {outOfStock && (
          <span className="px-2 py-1 text-xs rounded-md bg-danger-500 text-white">
            Out of Stock
          </span>
        )}
      </div>

      {/* Image */}
      <Link
        href={`/products/${encodeURIComponent(slug)}`}
        className="relative w-full aspect-[3/4] overflow-hidden bg-gray-100"
      >
        <Image
          src={imageUrl}
          alt={name}
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </Link>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4">
        <h3 className="text-sm font-semibold truncate text-text-primary">
          {name}
        </h3>

        <p className="mt-2 font-semibold text-accent-500">
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
        >
          {outOfStock ? "Out of Stock" : "Add to Cart"}
        </Button>
      </div>
    </article>
  );
}
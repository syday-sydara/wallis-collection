"use client";

import Image from "next/image";
import Button from "@/components/ui/Button";
import { ProductCard as ProductCardType, getCurrentPrice, getPrimaryImage } from "@/lib/types/products";

interface Props extends ProductCardType {
  onAddToCart?: () => void;
}

export default function ProductCard({
  id, name, slug, priceNaira, salePriceNaira,
  images, stock = 0, isNew, isOnSale, onAddToCart,
}: Props) {
  const price = getCurrentPrice({ priceNaira, salePriceNaira });
  const imageUrl = getPrimaryImage(images);
  const outOfStock = stock <= 0;

  return (
    <article className="relative flex flex-col rounded-lg bg-[var(--color-bg-surface)] shadow-card overflow-hidden group transition-all hover:-translate-y-1 hover:shadow-lg">
      {/* Badges */}
      <div className="absolute top-2 left-2 flex gap-2 z-10">
        {isNew && <span className="px-2 py-1 text-xs rounded-md bg-[var(--color-success-500)] text-white">New</span>}
        {isOnSale && <span className="px-2 py-1 text-xs rounded-md bg-[var(--color-accent-500)] text-white">Sale</span>}
      </div>

      {/* Image */}
      <a href={`/products/${encodeURIComponent(slug)}`} className="relative w-full aspect-[3/4] overflow-hidden bg-neutral-100">
        <Image src={imageUrl} alt={name} fill className="object-cover transition-transform duration-300 group-hover:scale-105" />
      </a>

      <div className="flex flex-col flex-1 p-4">
        <h3 className="text-sm font-semibold truncate">{name}</h3>
        <p className="mt-2 font-semibold text-[var(--color-primary-500)]">{price.toLocaleString("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 })}</p>
        <Button onClick={onAddToCart} disabled={outOfStock} className="w-full mt-3">Add to Cart</Button>
      </div>
    </article>
  );
}
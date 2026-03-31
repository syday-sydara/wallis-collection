"use client";

import Image from "next/image";
import Link from "next/link";
import type { ProductCardVM } from "@/lib/catalog/types";

type ProductCardProps = {
  product: ProductCardVM;
};

function formatPrice(kobo: number) {
  return `₦${(kobo / 100).toLocaleString("en-NG", {
    minimumFractionDigits: 0,
  })}`;
}

export default function ProductCard({ product }: ProductCardProps) {
  const image = product.images?.[0];

  const message = encodeURIComponent(
    `Hello, I want to order:\n\nProduct: ${product.name}\nPrice: ${formatPrice(
      product.minPrice
    )}`
  );

  return (
    <div className="relative card pressable overflow-hidden">
      {/* DISCOUNT */}
      {product.discountPercentage && product.discountPercentage > 0 && (
        <div className="absolute top-2 left-2 z-10 rounded bg-danger px-2 py-0.5 text-xs font-bold text-white">
          -{product.discountPercentage}%
        </div>
      )}

      {/* CLICKABLE AREA */}
      <Link href={`/product/${product.slug}`} className="block">
        <div className="relative aspect-square w-full bg-surface-muted">
          {image ? (
            <Image
              src={image.url}
              alt={image.alt || product.name}
              fill
              sizes="(max-width: 768px) 50vw, 25vw"
              className="object-cover"
              placeholder="blur"
              blurDataURL={image.blurDataURL || "/placeholder.png"}
              loading="lazy"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-text-muted">
              No image
            </div>
          )}
        </div>

        <div className="flex flex-col p-3 space-y-1">
          <h3 className="text-sm font-medium text-text line-clamp-2">
            {product.name}
          </h3>

          <p className="text-base font-semibold text-text">
            {formatPrice(product.minPrice)}
            {product.minPrice !== product.maxPrice &&
              ` - ${formatPrice(product.maxPrice)}`}
          </p>

          <span
            className={`text-xs font-medium ${
              product.inStock ? "text-success" : "text-danger"
            }`}
          >
            {product.inStock ? "✔ In stock" : "✖ Out of stock"}
          </span>
        </div>
      </Link>

      {/* ACTIONS (outside link) */}
      <div className="px-3 pb-3">
        <a
          href={`https://wa.me/234XXXXXXXXXX?text=${message}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-primary hover:underline"
        >
          Chat on WhatsApp
        </a>
      </div>
    </div>
  );
}
"use client";

import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { AddToCartButton } from "@/components/cart/AddToCartButton";
import Link from "next/link";

export function ProductCard({ product }) {
  const { id, name, minPrice, maxPrice, inStock, images } = product;

  const image = images?.[0]?.url ?? "/placeholder.png";
  const isRange = minPrice !== maxPrice;

  return (
    <Card
      padding="none"
      className="overflow-hidden group animate-fadeIn-fast hover:shadow-md transition-shadow"
    >
      {/* Image */}
      <Link href={`/product/${id}`} aria-label={`View product ${name}`}>
        <div className="relative aspect-square w-full bg-surface-muted overflow-hidden rounded-t-lg">
          <img
            src={image}
            alt={name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1">
            {!inStock && <Badge variant="danger">Out of Stock</Badge>}
          </div>
        </div>
      </Link>

      {/* Content */}
      <div className="p-4 space-y-2">
        <Link href={`/product/${id}`} aria-label={`View product ${name}`}>
          <h3 className="font-medium text-base text-text line-clamp-1 leading-none">
            {name}
          </h3>
        </Link>

        {/* Price */}
        <div className="flex items-center gap-2 leading-none">
          {isRange ? (
            <span className="font-semibold text-lg text-text leading-none">
              ₦{minPrice.toLocaleString()} – ₦{maxPrice.toLocaleString()}
            </span>
          ) : (
            <span className="font-semibold text-lg text-text leading-none">
              ₦{minPrice.toLocaleString()}
            </span>
          )}
        </div>

        {/* Add to Cart */}
        {inStock ? (
          <AddToCartButton
            productId={id}
            name={name}
            price={minPrice}
            image={image}
            fullWidth
          />
        ) : (
          <Button disabled fullWidth className="min-h-touch">
            Out of Stock
          </Button>
        )}
      </div>
    </Card>
  );
}
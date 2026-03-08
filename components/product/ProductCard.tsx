// components/products/ProductCard.tsx
"use client";

import Image from "next/image";
import { useState } from "react";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Skeleton from "@/components/ui/Skeleton";

interface ProductCardProps {
  id: string;
  name: string;
  slug: string;
  priceCents: number;
  currency?: string;
  images: string[];
  isNew?: boolean;
  isOnSale?: boolean;
  outOfStock?: boolean;
  loading?: boolean;
  onAddToCart?: (id: string) => void;
}

export default function ProductCard({
  id,
  name,
  slug,
  priceCents,
  currency = "NGN",
  images,
  isNew = false,
  isOnSale = false,
  outOfStock = false,
  loading = false,
  onAddToCart,
}: ProductCardProps) {
  const [hovered, setHovered] = useState(false);

  if (loading) {
    return <Skeleton className="h-80 w-full rounded-lg" />;
  }

  return (
    <div className="card flex flex-col relative overflow-hidden">
      {/* Badges */}
      <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
        {isNew && <Badge variant="success">New</Badge>}
        {isOnSale && <Badge variant="warning">Sale</Badge>}
        {outOfStock && <Badge variant="danger">Out of stock</Badge>}
      </div>

      {/* Image */}
      <a
        href={`/products/${slug}`}
        className="relative w-full h-80 overflow-hidden rounded-lg"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {images.length ? (
          <Image
            src={hovered && images[1] ? images[1] : images[0]}
            alt={name}
            fill
            className="object-cover transition-transform duration-300"
          />
        ) : (
          <Skeleton className="h-80 w-full rounded-lg" />
        )}
      </a>

      {/* Info */}
      <div className="mt-3 flex flex-col gap-1">
        <a href={`/products/${slug}`} className="font-medium text-sm hover:text-primary">
          {name}
        </a>
        <span className="font-semibold">
            ₦{priceCents.toLocaleString("en-NG")}
        </span>
      </div>

      {/* Add to Cart */}
      {!outOfStock && (
        <Button
          variant="primary"
          className="mt-3 w-full"
          onClick={() => onAddToCart?.(id)}
        >
          Add to Cart
        </Button>
      )}
    </div>
  );
}
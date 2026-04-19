"use client";

import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import AddToCartButton from "@/components/cart/AddToCartButton";
import Link from "next/link";
import Image from "next/image";
import { formatCurrency } from "@/lib/utils";

type Props = {
  product: {
    id: string;
    slug: string;
    name: string;
    minPrice: number;
    maxPrice: number;
    inStock: boolean;
    discountPercent?: number;
    images?: { url: string }[];
  };
};

export default function ProductCard({ product }: Props) {
  const { id, slug, name, minPrice, maxPrice, inStock, discountPercent, images } = product;
  const image = images?.[0]?.url ?? "/placeholder.png";
  const isRange = minPrice !== maxPrice;

  return (
    <Card
      padding="none"
      className="overflow-hidden group animate-fadeIn-fast hover:shadow-md hover:border-border transition-all duration-300"
    >
      {/* Product Image */}
      <Link
        href={`/product/${slug}`}
        aria-label={`View product ${name}`}
        prefetch={false}
      >
        <div className="relative aspect-square w-full bg-surface-muted overflow-hidden rounded-t-lg">
          <Image
            src={image}
            alt={name || "Product image"}
            fill
            loading="lazy"
            sizes="(max-width: 640px) 100vw, 50vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            placeholder="blur"
            blurDataURL="/placeholder.png"
          />

          {/* Out of Stock */}
          {!inStock && (
            <Badge variant="danger" className="absolute top-3 left-3">
              Out of Stock
            </Badge>
          )}

          {/* Discount */}
          {discountPercent && discountPercent > 0 && (
            <Badge variant="warning" className="absolute top-3 right-3">
              -{discountPercent}%
            </Badge>
          )}
        </div>
      </Link>

      {/* Product Content */}
      <div className="p-3 sm:p-4 space-y-1.5">
        <Link href={`/product/${slug}`} prefetch={false}>
          <h3 className="font-medium text-sm sm:text-base text-text line-clamp-1 leading-tight">
            {name || "Unnamed Product"}
          </h3>
        </Link>

        {/* Price */}
        <div className="flex items-center gap-1.5 text-sm sm:text-base leading-none">
          {isRange ? (
            <span className="font-semibold text-text">
              {formatCurrency(minPrice)} – {formatCurrency(maxPrice)}
            </span>
          ) : (
            <span className="font-semibold text-text">
              {formatCurrency(minPrice)}
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
            className="min-h-touch"
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

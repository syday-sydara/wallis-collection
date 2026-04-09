"use client";

import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import AddToCartButton from "@/components/cart/AddToCartButton";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import type { ProductCardVM } from "@/lib/products/types";

type Props = {
  product: ProductCardVM;
};

export default function ProductCard({ product }: Props) {
  const { id, name, minPrice, maxPrice, inStock, images } = product;
  const image = images?.[0]?.url ?? "/placeholder.png";
  const isRange = minPrice !== maxPrice;

  return (
    <Card
      padding="none"
      className={cn(
        "overflow-hidden group hover:shadow-md transition-shadow duration-300 flex flex-col"
      )}
    >
      {/* Product Image */}
      <Link
        href={`/product/${id}`}
        aria-label={`View product ${name}`}
        prefetch={false}
        className="relative w-full aspect-square bg-surface-muted overflow-hidden rounded-t-lg"
      >
        <Image
          src={image}
          alt={name}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, 50vw"
          priority
        />

        {/* Out of stock badge */}
        {!inStock && (
          <div className="absolute top-3 left-3">
            <Badge variant="danger">Out of Stock</Badge>
          </div>
        )}
      </Link>

      {/* Product Content */}
      <div className="p-4 flex flex-col flex-1 justify-between space-y-2">
        {/* Product Name */}
        <Link href={`/product/${id}`} prefetch={false}>
          <h3 className="font-medium text-sm sm:text-base text-text line-clamp-1">
            {name}
          </h3>
        </Link>

        {/* Price */}
        <div className="text-sm sm:text-base font-semibold text-text">
          {isRange
            ? `₦${minPrice.toLocaleString()} – ₦${maxPrice.toLocaleString()}`
            : `₦${minPrice.toLocaleString()}`}
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
          <button
            disabled
            className="w-full mt-2 rounded-md bg-surface text-text opacity-50 cursor-not-allowed py-2 text-sm font-medium"
          >
            Out of Stock
          </button>
        )}
      </div>
    </Card>
  );
}
import * as React from "react";
import { cn } from "@/lib/cn";
import { Price } from "@/components/shop/Price";
import { AddToCartButton } from "@/components/shop/AddToCartButton";

export interface ProductCardProps
  extends React.HTMLAttributes<HTMLDivElement> {
  image: string;
  title: string;
  price: number;
  originalPrice?: number;
}

export function ProductCard({
  image,
  title,
  price,
  originalPrice,
  className,
  ...props
}: ProductCardProps) {
  return (
    <div
      className={cn(
        "rounded-md border border-border bg-bg shadow-sm p-3 flex flex-col gap-3",
        className
      )}
      {...props}
    >
      {/* Image */}
      <div className="w-full aspect-square rounded-md overflow-hidden bg-bg-muted">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Title */}
      <h3 className="text-sm font-medium text-text line-clamp-2">
        {title}
      </h3>

      {/* Price */}
      <Price amount={price} original={originalPrice} />

      {/* Buttons */}
      <div className="flex flex-col gap-2 mt-auto">
        <AddToCartButton variant="basket" className="w-full">
          Add to Basket
        </AddToCartButton>

        <AddToCartButton variant="buy" className="w-full">
          Buy Now
        </AddToCartButton>
      </div>
    </div>
  );
}

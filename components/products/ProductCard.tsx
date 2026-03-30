"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { formatCurrency } from "@/lib/utils";

type Product = {
  id: string;
  name: string;
  slug: string;
  image?: string;
  price: number; // in kobo
};

export default function ProductCard({ product }: { product: Product }) {
  const [imgError, setImgError] = useState(false);

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group block rounded-lg border border-border bg-surface p-3 shadow-sm transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
    >
      <div className="aspect-square w-full overflow-hidden rounded-md bg-surface-muted">
        {product.image && !imgError ? (
          <Image
            src={product.image}
            alt={product.name}
            width={400}
            height={400}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            onError={() => setImgError(true)}
            className="h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-text-subtle">
            No image
          </div>
        )}
      </div>

      <h3 className="mt-2 line-clamp-2 text-sm font-medium text-text">
        {product.name}
      </h3>

      <p className="mt-1 text-base font-semibold text-primary">
        {product.price > 0 ? formatCurrency(product.price) : "—"}
      </p>
    </Link>
  );
}
"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useCart } from "@/components/cart/cart-context";
import type { Product } from "@/lib/types";
import { formatPrice } from "@/lib/formatters";

export default function ProductCard({ product }: { product: Product }) {
  const { add } = useCart();
  const [loading, setLoading] = useState(false);

  const price = formatPrice(product.priceNaira);

  const image =
    Array.isArray(product.images) && product.images.length > 0
      ? product.images[0]
      : null;

  const stockStatus =
    product.stock === 0
      ? {
          label: "Out of stock",
          color: "bg-danger/10 text-danger",
        }
      : product.stock < 5
      ? {
          label: "Low stock",
          color: "bg-warning/10 text-warning",
        }
      : {
          label: "In stock",
          color: "bg-success/10 text-success",
        };

  return (
    <div className="group relative bg-bg border border-neutral/20 rounded-xl overflow-hidden shadow-soft hover:shadow-card transition-all duration-400">
      <Link
        href={`/products/${product.slug}`}
        className="block relative h-64 bg-neutral/10 overflow-hidden"
      >
        {image ? (
          <Image
            src={image}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-neutral text-sm">
            No Image
          </div>
        )}
      </Link>

      <div className="p-4 space-y-3">
        <h3 className="heading-3 text-primary text-base line-clamp-1">
          {product.name}
        </h3>

        <p className="text-lg font-semibold text-secondary tracking-tight">
          {price}
        </p>

        <span
          className={`label inline-block px-2 py-1 rounded-md ${stockStatus.color}`}
        >
          {stockStatus.label}
        </span>

        <button
          disabled={product.stock === 0 || loading}
          onClick={() => {
            setLoading(true);
            add({
              id: product.id,
              slug: product.slug,
              name: product.name,
              priceCents: product.priceNaira * 100,
              quantity: 1,
              image,
            });
            setTimeout(() => setLoading(false), 500);
          }}
          className="w-full bg-primary text-bg text-sm py-2.5 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 font-medium tracking-wide"
        >
          {loading ? "Adding..." : "Add to Cart"}
        </button>
      </div>
    </div>
  );
}
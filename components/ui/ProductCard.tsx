"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import type { Product } from "@/lib/types";
import { formatPrice } from "@/lib/formatters";

export default function ProductCard({ product }: { product: Product }) {
  const [loading, setLoading] = useState(false);

  const price = formatPrice(product.priceCents);
  const image =
    Array.isArray(product.images) && product.images.length > 0
      ? product.images[0]
      : null;

  // Fixed: Removed "status-" prefix to match your globals.css @theme
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
      {/* Image */}
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

      {/* Content */}
      <div className="p-4 space-y-3">
        <h3 className="text-sm font-medium text-primary line-clamp-1">
          {product.name}
        </h3>

        <p className="text-lg font-semibold text-secondary">{price}</p>

        <span
          className={`inline-block text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-md ${stockStatus.color}`}
        >
          {stockStatus.label}
        </span>

        <button
          disabled={product.stock === 0 || loading}
          onClick={async () => {
            try {
              setLoading(true);
              // TODO: Replace with real cart API call
              await new Promise((res) => setTimeout(res, 800));
            } finally {
              setLoading(false);
            }
          }}
          className="w-full bg-primary text-bg text-sm py-2.5 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 font-medium"
        >
          {loading ? "Adding..." : "Add to Cart"}
        </button>
      </div>
    </div>
  );
}
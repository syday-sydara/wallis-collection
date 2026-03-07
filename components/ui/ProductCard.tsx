"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useMemo } from "react";
import { useCart } from "@/components/cart/cart-context";
import type { ProductCardData } from "@/lib/types";
import { formatPrice } from "@/lib/formatters";

export default function ProductCard({ product }: { product: ProductCardData }) {
  const { add } = useCart();
  const [loading, setLoading] = useState(false);

  const price = formatPrice(product.priceNaira);

  const image = useMemo(() => (product.images?.[0] ?? null), [product.images]);

  const stockStatus = useMemo(() => {
    if (product.stock === 0) return { label: "Out of stock", color: "bg-danger/10 text-danger" };
    if (product.stock < 5) return { label: "Low stock", color: "bg-warning/10 text-warning" };
    return { label: "In stock", color: "bg-success/10 text-success" };
  }, [product.stock]);

  const handleAddToCart = () => {
    if (product.stock === 0) return;
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
  };

  return (
    <div className="group relative card overflow-hidden hover:shadow-card transition-all duration-400">
      <Link
        href={`/products/${product.slug}`}
        className="block relative h-64 bg-neutral/10 overflow-hidden"
        aria-label={`View details for ${product.name}`}
      >
        {product.images.length > 0 ? (
          <>
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover transition-opacity duration-500 group-hover:opacity-0"
            />
            {product.images[1] && (
              <Image
                src={product.images[1]}
                alt={`${product.name} alternate view`}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
              />
            )}
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-neutral text-sm">
            No Image
          </div>
        )}
      </Link>

      <div className="p-4 space-y-3">
        <h3 className="heading-3 text-primary-500 line-clamp-1">{product.name}</h3>
        <p className="text-lg font-semibold text-secondary tracking-tight">{price}</p>
        <span className={`label inline-block px-2 py-1 rounded-md ${stockStatus.color}`}>
          {stockStatus.label}
        </span>
        <button
          disabled={product.stock === 0 || loading}
          onClick={handleAddToCart}
          className="w-full btn btn-primary text-bg text-sm py-2.5 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 font-medium tracking-wide"
        >
          {loading ? "Adding..." : "Add to Cart"}
        </button>
      </div>
    </div>
  );
}
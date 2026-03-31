"use client";

import { useState } from "react";
import { formatCurrency } from "@/lib/utils";
import Gallery from "./Gallery";
import VariantSelector from "./VariantSelector";
import AddToCartButton from "./AddToCartButton";

function getDisplayPrice(product, selected) {
  if (selected) return formatCurrency(selected.price);
  if (product.minPrice === product.maxPrice) return formatCurrency(product.minPrice);
  return `${formatCurrency(product.minPrice)} – ${formatCurrency(product.maxPrice)}`;
}

export default function ProductClient({ product }: Props) {
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(
    product.variants.length === 1 ? product.variants[0] : null
  );

  const requiresVariant = product.variants.length > 0;
  const hasSelectedVariant = !requiresVariant || selectedVariant !== null;
  const canAddToCart = product.inStock && hasSelectedVariant;

  const displayPrice = getDisplayPrice(product, selectedVariant);

  return (
    <>
      <main className="mx-auto max-w-6xl px-4 py-10 grid gap-10 md:grid-cols-2">
        <Gallery images={product.images} />

        <article className="space-y-6">
          <header>
            <h1 className="text-xl font-semibold tracking-tight">{product.name}</h1>
            <p className="mt-1 text-text-muted">{displayPrice}</p>
            {!product.inStock && (
              <p className="mt-2 text-sm text-outofstock">Out of stock</p>
            )}
          </header>

          {product.description && (
            <p className="text-sm leading-relaxed text-text-muted">
              {product.description}
            </p>
          )}

          <VariantSelector
            variants={product.variants}
            selected={selectedVariant}
            onChange={setSelectedVariant}
          />

          <AddToCartButton
            productId={product.id}
            variant={selectedVariant ?? undefined}
            disabled={!canAddToCart}
          />
        </article>
      </main>

      <div className="fixed bottom-0 left-0 right-0 border-t border-border-subtle bg-surface p-4 md:hidden">
        <AddToCartButton
          productId={product.id}
          variant={selectedVariant ?? undefined}
          disabled={!canAddToCart}
        />
      </div>
    </>
  );
}
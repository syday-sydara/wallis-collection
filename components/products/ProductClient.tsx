"use client";

import { useState } from "react";
import Gallery from "./Gallery";
import VariantSelector from "./VariantSelector";
import AddToCartButton from "../cart/AddToCartButton";
import ProductCard from "./ProductCard";
import type { ProductDetailVM } from "@/lib/products/types";
import { formatCurrency } from "@/lib/utils";

type Props = {
  product: ProductDetailVM;
};

function getDisplayPrice(product: ProductDetailVM, selected?: ProductDetailVM["variants"][0]) {
  if (selected) return formatCurrency(selected.price);
  if (product.minPrice === product.maxPrice) return formatCurrency(product.minPrice);
  return `${formatCurrency(product.minPrice)} – ${formatCurrency(product.maxPrice)}`;
}

export default function ProductClient({ product }: Props) {
  const [selectedVariant, setSelectedVariant] = useState(
    product.variants.length === 1 ? product.variants[0] : undefined
  );

  const requiresVariant = product.variants.length > 0;
  const hasSelectedVariant = !requiresVariant || selectedVariant !== undefined;
  const canAddToCart = product.inStock && hasSelectedVariant;

  const displayPrice = getDisplayPrice(product, selectedVariant);

  return (
    <>
      {/* Main Product Section */}
      <main className="mx-auto max-w-6xl px-4 py-6 grid gap-6 md:grid-cols-2 animate-fadeIn">
        {/* Gallery */}
        <Gallery images={product.images} />

        {/* Product Info */}
        <article className="space-y-4">
          <header>
            <h1 className="text-xl font-semibold text-text">{product.name}</h1>

            <p aria-live="polite" className="mt-1 text-text-muted text-lg font-medium">
              {displayPrice}
            </p>

            {!product.inStock && (
              <p className="mt-2 text-sm text-danger font-medium">Out of stock</p>
            )}
          </header>

          {product.description && (
            <p className="text-sm text-text-muted leading-relaxed max-w-prose">
              {product.description}
            </p>
          )}

          {/* Variant Selector */}
          <VariantSelector
            variants={product.variants}
            selected={selectedVariant ?? null}
            onChange={setSelectedVariant}
          />

          {/* Desktop AddToCart */}
          <div className="hidden md:block">
            <AddToCartButton
              productId={product.id}
              variant={selectedVariant}
              disabled={!canAddToCart}
              fullWidth
            />
          </div>
        </article>
      </main>

      {/* Recommended Products */}
      {product.recommended?.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-6 animate-fadeIn-fast">
          <h2 className="text-lg font-semibold mb-4 text-text">You may also like</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {product.recommended.map((r) => (
              <ProductCard key={r.id} product={r} />
            ))}
          </div>
        </section>
      )}

      {/* Mobile sticky AddToCart */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-border bg-surface p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] md:hidden animate-fadeIn-up">
        <AddToCartButton
          productId={product.id}
          variant={selectedVariant}
          disabled={!canAddToCart}
          fullWidth
        />
      </div>
    </>
  );
}
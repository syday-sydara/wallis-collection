"use client";

import { useState } from "react";
import Gallery from "@/components/products/Gallery";
import VariantSelector from "@/components/products/VariantSelector";
import AddToCartButton from "@/components/cart/AddToCartButton";
import ProductCard from "@/components/products/ProductCard";
import type { ProductDetailVM } from "@/lib/products/types";
import { formatCurrency } from "@/lib/utils";

type Props = {
  product: ProductDetailVM;
};

function getDisplayPrice(
  product: ProductDetailVM,
  selected?: ProductDetailVM["variants"][0]
) {
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
            <h1 className="text-xl sm:text-2xl font-semibold text-text">
              {product.name}
            </h1>

            <p
              aria-live="polite"
              className="mt-1 text-text-muted text-lg sm:text-xl font-medium"
            >
              {displayPrice}
            </p>

            {!product.inStock && (
              <p className="mt-2 text-sm sm:text-base text-danger font-medium">
                Out of stock
              </p>
            )}

            {/* Low stock */}
            {product.inStock && product.stock !== undefined && product.stock < 5 && (
              <p className="mt-1 text-warning text-sm font-medium">
                Only {product.stock} left
              </p>
            )}
          </header>

          {/* Description */}
          {product.description && (
            <p className="text-sm sm:text-base text-text-muted leading-relaxed max-w-prose">
              {product.description}
            </p>
          )}

          {/* Variant Selector */}
          {requiresVariant && (
            <VariantSelector
              variants={product.variants}
              selected={selectedVariant ?? null}
              onChange={setSelectedVariant}
            />
          )}

          {/* Delivery Info */}
          <div className="border border-border rounded-md p-3 text-sm text-text-muted space-y-1">
            <p>Delivery: 1–3 days within Lagos, 2–5 days nationwide</p>
            <p>Returns: 7‑day return policy</p>
            <p>Shipping fee calculated at checkout</p>
          </div>

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
          <h2 className="text-lg sm:text-xl font-semibold mb-4 text-text">
            You may also like
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {product.recommended.map((r) => (
              <div key={r.id} className="animate-fadeIn-fast">
                <ProductCard product={r} />
              </div>
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

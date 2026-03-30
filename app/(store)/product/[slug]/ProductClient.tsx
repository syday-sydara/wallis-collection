"use client";

import { useState } from "react";
import { formatCurrency } from "@/lib/utils/index";
import Gallery from "./Gallery";
import VariantSelector from "./VariantSelector";
import AddToCartButton from "./AddToCartButton";

interface Props {
  product: {
    id: string;
    name: string;
    description?: string;
    price: number;
    images: { url: string }[];
    variants: any[];
    inStock: boolean;
  };
  slug: string;
}

export default function ProductClient({ product }: Props) {
  const [selectedVariant, setSelectedVariant] = useState<any>(null);

  const price = formatCurrency(product.price);

  return (
    <>
      <main className="mx-auto max-w-6xl px-4 py-10 grid gap-10 md:grid-cols-2">
        {/* Gallery */}
        <Gallery images={product.images} />

        {/* Details */}
        <article className="space-y-6">
          {/* Title */}
          <header>
            <h1 className="text-xl font-semibold tracking-tight">
              {product.name}
            </h1>

            <p className="text-text-muted mt-1">{price}</p>

            {!product.inStock && (
              <p className="text-sm text-outofstock mt-2">
                Out of stock
              </p>
            )}
          </header>

          {/* Description */}
          {product.description && (
            <p className="text-sm text-text-muted leading-relaxed">
              {product.description}
            </p>
          )}

          {/* Variants */}
          <VariantSelector
            variants={product.variants}
            onChange={setSelectedVariant}
          />

          {/* CTA */}
          <AddToCartButton
            productId={product.id}
            variant={selectedVariant}
            disabled={!product.inStock}
          />

          {/* WhatsApp fallback */}
          <a
            href={`https://wa.me/234XXXXXXXXXX?text=I want to order ${product.name}`}
            className="block text-sm text-primary"
          >
            Order via WhatsApp
          </a>

          {/* Info */}
          <section className="pt-6 border-t border-border-subtle space-y-4 text-sm text-text-muted">
            <div>
              <h3 className="font-medium text-text">Fabric & Care</h3>
              <p>Premium cotton blend. Machine wash cold.</p>
            </div>

            <div>
              <h3 className="font-medium text-text">Delivery</h3>
              <p>Lagos: 24–48h • Outside Lagos: 2–4 days</p>
            </div>
          </section>
        </article>
      </main>

      {/* Mobile Sticky CTA */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-border-subtle bg-surface p-4 md:hidden">
        <AddToCartButton
          productId={product.id}
          variant={selectedVariant}
          disabled={!product.inStock}
        />
      </div>
    </>
  );
}
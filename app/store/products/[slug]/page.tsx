"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronDown, ChevronUp } from "lucide-react";
import AddToCartButton from "@/components/cart/AddToCartButton";
import { formatCurrency } from "@/lib/utils/formatters/currency";
import { cn } from "@/lib/utils";

export default function ProductPage({ product }) {
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const whatsappMessage = [
    `Hello! I want to order:`,
    ``,
    `${product.name}`,
    selectedVariant
      ? `Variant: ${Object.values(selectedVariant.attributes).join(" / ")}`
      : "",
    ``,
    `Price: ${formatCurrency(selectedVariant?.price ?? product.price)}`,
    ``,
    `Please confirm delivery fee and availability.`,
  ]
    .filter(Boolean)
    .join("\n");

  const whatsappLink = `https://wa.me/2348000000001?text=${encodeURIComponent(
    whatsappMessage
  )}`;

  return (
    <div className="pb-safe">
      {/* ---------- IMAGE GALLERY ---------- */}
      <div className="relative w-full h-[380px] bg-surface-muted">
        <Image
          src={product.images[0]?.url ?? "/placeholder.png"}
          alt={product.name}
          fill
          className="object-cover"
          priority
        />
      </div>

      <div className="p-4 space-y-6">
        {/* ---------- NAME + PRICE ---------- */}
        <div>
          <h1 className="text-xl font-semibold text-text">{product.name}</h1>

          <div className="mt-1 flex items-center gap-2">
            <span className="text-2xl font-bold text-text">
              {formatCurrency(selectedVariant?.price ?? product.price)}
            </span>

            {product.compareAtPrice && (
              <span className="text-sm line-through text-text-muted">
                {formatCurrency(product.compareAtPrice)}
              </span>
            )}
          </div>
        </div>

        {/* ---------- VARIANT SELECTOR ---------- */}
        {product.variants?.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-text">Select Variant</p>

            <div className="flex flex-wrap gap-2">
              {product.variants.map((v) => {
                const label = Object.values(v.attributes).join(" / ");
                const isActive = selectedVariant?.id === v.id;

                return (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVariant(v)}
                    className={cn(
                      "px-3 py-2 rounded-md border text-sm active:scale-95 transition",
                      isActive
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-surface border-border text-text"
                    )}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ---------- ACTION BUTTONS ---------- */}
        <div className="space-y-3">
          <AddToCartButton
            productId={product.id}
            name={product.name}
            image={product.images[0]?.url}
            variant={selectedVariant}
            requiresVariant={product.variants?.length > 0}
          />

          {/* WhatsApp Checkout */}
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full bg-green-500 text-white text-center py-3 rounded-lg font-semibold active:scale-95 transition"
          >
            Order on WhatsApp
          </a>

          {/* Website Checkout */}
          <Link
            href="/checkout"
            className="block w-full border border-border text-text text-center py-3 rounded-lg font-medium active:scale-95 transition"
          >
            Checkout on Website
          </Link>
        </div>

        {/* ---------- PRODUCT DETAILS ---------- */}
        <div className="border-t border-border pt-4">
          <button
            onClick={() => setDetailsOpen((v) => !v)}
            className="flex items-center justify-between w-full text-left"
          >
            <span className="font-medium text-text">Product Details</span>
            {detailsOpen ? (
              <ChevronUp className="h-5 w-5 text-text-muted" />
            ) : (
              <ChevronDown className="h-5 w-5 text-text-muted" />
            )}
          </button>

          {detailsOpen && (
            <p className="mt-3 text-sm text-text-muted leading-relaxed animate-fadeIn-fast">
              {product.description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

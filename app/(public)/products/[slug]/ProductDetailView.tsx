"use client";

import Image from "next/image";
import { useState, useMemo, useEffect, useRef } from "react";
import clsx from "clsx";
import { useCart } from "@/components/cart/cart-context";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1520975918318-3a4e6e791f6b?q=80&w=1200&auto=format&fit=crop";

function VariantSelector({ label, options, value, onChange }) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-[var(--color-text-secondary)]">{label}</p>

      <div role="radiogroup" className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const disabled = opt.stock <= 0;
          const selected = value === opt.value;

          return (
            <button
              key={opt.value}
              role="radio"
              aria-checked={selected}
              aria-disabled={disabled}
              disabled={disabled}
              onClick={() => !disabled && onChange(opt.value)}
              className={clsx(
                "px-4 py-2 rounded-md border text-sm transition",
                disabled && "opacity-40 cursor-not-allowed",
                selected
                  ? "border-[var(--color-primary-500)] bg-[var(--color-primary-500)] text-white"
                  : "border-[var(--color-border)] hover:border-[var(--color-primary-500)]"
              )}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ZoomModal({ src, alt, open, onClose }) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      <img
        src={src}
        alt={alt}
        className="max-w-full max-h-full object-contain touch-none"
      />
    </div>
  );
}

function StickyCartBar({ price, onAdd, visible }) {
  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[var(--color-bg-surface)] border-t border-[var(--color-border)] p-4 flex items-center justify-between lg:hidden z-40">
      <p className="font-semibold text-[var(--color-primary-500)]">
        ₦{price.toLocaleString("en-NG")}
      </p>
      <Button variant="primary" onClick={onAdd}>
        Add to Cart
      </Button>
    </div>
  );
}

export default function ProductDetailView({ product }) {
  const { addItem } = useCart();

  const images = product.images ?? [];
  const initialImage = images[0]?.url ?? FALLBACK_IMAGE;

  const [selectedImage, setSelectedImage] = useState(initialImage);
  const [zoomOpen, setZoomOpen] = useState(false);
  const [selectedSize, setSelectedSize] = useState(null);

  const price = useMemo(() => {
    const discounted = product.salePriceNaira != null;
    return {
      current: discounted ? product.salePriceNaira : product.priceNaira,
      original: product.priceNaira,
      discounted,
    };
  }, [product.salePriceNaira, product.priceNaira]);

  const stockMessage = useMemo(() => {
    if (product.stock <= 0) return "Out of stock";
    if (product.stock <= 10) return `Only ${product.stock} left`;
    return "In stock";
  }, [product.stock]);

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: price.current,
      quantity: 1,
      image: selectedImage || FALLBACK_IMAGE,
      size: selectedSize,
    });
  };

  const buttonRef = useRef(null);
  const [stickyVisible, setStickyVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setStickyVisible(!entry.isIntersecting),
      { threshold: 0 }
    );

    if (buttonRef.current) observer.observe(buttonRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <ZoomModal
        src={selectedImage}
        alt={product.name}
        open={zoomOpen}
        onClose={() => setZoomOpen(false)}
      />

      <div className="w-full max-w-6xl mx-auto py-8 px-4 flex flex-col lg:flex-row gap-10">
        <div className="flex-1 space-y-4">
          <Image
            src={selectedImage}
            alt={product.name}
            width={600}
            height={800}
            className="rounded-lg object-cover w-full h-auto cursor-zoom-in"
            priority
            onClick={() => setZoomOpen(true)}
          />

          {images.length > 1 && (
            <div className="flex space-x-3 mt-2 overflow-x-auto pb-2">
              {images.map((img) => {
                const isActive = img.url === selectedImage;
                return (
                  <button
                    key={img.id}
                    onClick={() => setSelectedImage(img.url)}
                    aria-selected={isActive}
                    className={clsx(
                      "w-20 h-20 rounded-md overflow-hidden border-2 transition-all",
                      isActive
                        ? "border-[var(--color-primary-500)]"
                        : "border-[var(--color-border)] hover:border-[var(--color-primary-500)]"
                    )}
                  >
                    <Image
                      src={img.url}
                      alt={product.name}
                      width={80}
                      height={80}
                      loading="lazy"
                      className="object-cover w-full h-full"
                    />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex-1 space-y-5">
          <div className="flex items-center gap-2">
            {product.isNew && <Badge variant="success">New</Badge>}
            {price.discounted && <Badge variant="warning">Sale</Badge>}
          </div>

          <h1 className="heading-2">{product.name}</h1>

          <div className="flex items-baseline gap-3">
            <p className="text-2xl font-semibold text-[var(--color-primary-500)]">
              ₦{price.current.toLocaleString("en-NG")}
            </p>

            {price.discounted && (
              <p className="text-sm line-through text-[var(--color-text-muted)]">
                ₦{price.original.toLocaleString("en-NG")}
              </p>
            )}
          </div>

          <p className="text-sm text-[var(--color-text-secondary)]" aria-live="polite">
            {stockMessage}
          </p>

          <VariantSelector
            label="Size"
            options={product.sizes ?? []}
            value={selectedSize}
            onChange={setSelectedSize}
          />

          {product.description && (
            <p className="text-[var(--color-text-secondary)] leading-relaxed max-w-prose">
              {product.description}
            </p>
          )}

          {product.stock > 0 ? (
            <Button
              ref={buttonRef}
              variant="primary"
              onClick={handleAddToCart}
              aria-label={`Add ${product.name} to cart`}
            >
              Add to Cart
            </Button>
          ) : (
            <span className="px-4 py-2 bg-red-100 text-red-600 rounded-md font-semibold">
              Out of Stock
            </span>
          )}
        </div>
      </div>

      <StickyCartBar
        price={price.current}
        onAdd={handleAddToCart}
        visible={stickyVisible && product.stock > 0}
      />
    </>
  );
}
"use client";

import Image from "next/image";
import { useState, useEffect, useCallback, useRef } from "react";
import { useCart } from "@/components/cart/CartProvider";
import Button from "@/components/ui/Button";

const FALLBACK_IMAGE = "/fallback-product.jpg";

function ZoomModal({ src, alt, open, onClose }: { src: string; alt: string; open: boolean; onClose: () => void }) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
      onClick={onClose}
    >
      <Image src={src} alt={alt} width={1200} height={1200} className="object-contain pointer-events-none" />
    </div>
  );
}

export default function ProductDetailView({ product }: { product: any }) {
  const { addItem } = useCart();
  const images = product?.images ?? [];
  const [selectedImage, setSelectedImage] = useState(images[0]?.url || FALLBACK_IMAGE);
  const [zoomOpen, setZoomOpen] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [stickyVisible, setStickyVisible] = useState(false);

  if (!product) return <p className="text-center text-lg text-danger-500">Product not found.</p>;

  const discounted = product.salePriceNaira != null;
  const currentPrice = discounted ? product.salePriceNaira : product.priceNaira;
  const isOutOfStock = product.stock <= 0;

  const handleAddToCart = useCallback(() => {
    if (isOutOfStock) return;
    const variantKey = selectedSize ? `size:${selectedSize}` : "default";
    addItem({
      productId: product.id,
      name: product.name,
      price: currentPrice,
      quantity: 1,
      image: selectedImage,
      variants: { size: selectedSize ?? "Default" },
      key: `${product.id}-${variantKey}`,
      addedAt: new Date(),
    });
    window.dispatchEvent(new CustomEvent("open-cart"));
  }, [product, currentPrice, selectedImage, selectedSize, isOutOfStock, addItem]);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setStickyVisible(!entry.isIntersecting), { threshold: 0 });
    if (buttonRef.current) observer.observe(buttonRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <ZoomModal src={selectedImage} alt={product.name} open={zoomOpen} onClose={() => setZoomOpen(false)} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Images */}
        <div className="space-y-4">
          <div className="relative aspect-[4/5] overflow-hidden rounded-xl card">
            <Image
              src={selectedImage}
              alt={product.name}
              fill
              className="object-cover cursor-zoom-in transition-transform duration-300"
              onClick={() => setZoomOpen(true)}
            />
          </div>

          {images.length > 1 && (
            <div className="flex gap-4 overflow-x-auto pb-2">
              {images.map((img: any) => (
                <button
                  key={img.id}
                  onClick={() => setSelectedImage(img.url)}
                  className={`relative h-24 w-20 flex-shrink-0 rounded-md overflow-hidden border-2 transition-all ${
                    selectedImage === img.url ? "border-accent-500" : "border-transparent"
                  }`}
                >
                  <Image src={img.url} alt={product.name} fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="flex flex-col gap-6">
          <div>
            <h1 className="heading-1">{product.name}</h1>
            <p className="text-text-secondary mt-1">{product.category} — {product.brand}</p>
          </div>

          <div className="flex items-center gap-3">
            <p className="text-3xl font-semibold text-accent-500">{formatPrice(currentPrice)}</p>
            {discounted && (
              <p className="text-xl text-text-muted line-through">{formatPrice(product.priceNaira)}</p>
            )}
          </div>

          {/* Sizes */}
          {product.sizes?.length > 0 && (
            <div className="space-y-3">
              <span className="text-small font-medium uppercase tracking-wider">Select Size</span>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size: string) => {
                  const isSizeOutOfStock = product.stockBySize?.[size] <= 0;
                  return (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      disabled={isSizeOutOfStock}
                      className={`min-w-[3rem] px-4 py-2 border rounded-md transition-all ${
                        selectedSize === size
                          ? "bg-gray-900 text-white border-gray-900"
                          : "border-gray-200 hover:border-gray-900"
                      } ${isSizeOutOfStock ? "bg-gray-200 cursor-not-allowed" : ""}`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <p className="text-body text-text-secondary">{product.description}</p>

          <Button
            ref={buttonRef}
            variant="primary"
            onClick={handleAddToCart}
            disabled={isOutOfStock || (product.sizes?.length && !selectedSize)}
            className="w-full py-4 text-lg"
          >
            {isOutOfStock ? "Out of Stock" : "Add to Cart"}
          </Button>
        </div>
      </div>

      {/* Sticky mobile cart bar */}
      {stickyVisible && !isOutOfStock && (
        <div className="fixed bottom-0 left-0 right-0 z-40 p-4 flex items-center justify-between bg-bg-surface border-t shadow-lg lg:hidden">
          <p className="font-semibold text-accent-500">{formatPrice(currentPrice)}</p>
          <Button variant="primary" onClick={handleAddToCart}>
            Add to Cart
          </Button>
        </div>
      )}
    </>
  );
}
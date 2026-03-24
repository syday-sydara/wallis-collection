"use client";

import Image from "next/image";
import { useState } from "react";
import { useCart } from "@/components/cart/cart-context";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1520975918318-3a4e6e791f6b?q=80&w=1200&auto=format&fit=crop";

export default function ProductDetailView({ product }) {
  const { addItem } = useCart();

  const images = product.images ?? [];
  const initialImage = images[0]?.url ?? FALLBACK_IMAGE;
  const [selectedImage, setSelectedImage] = useState(initialImage);

  const [selectedSize, setSelectedSize] = useState(null);

  const price = product.salePriceNaira ?? product.priceNaira ?? 0;

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      price,
      quantity: 1,
      image: selectedImage,
      variants: {
        size: selectedSize ?? "Default",
      },
    });
  };

  return (
    <div className="w-full max-w-6xl mx-auto py-10 px-4 flex flex-col lg:flex-row gap-12">
      {/* Image Gallery */}
      <div className="flex-1 space-y-4">
        <div className="relative w-full overflow-hidden rounded-lg bg-neutral-100">
          <Image
            src={selectedImage}
            alt={product.name}
            width={600}
            height={800}
            className="object-cover w-full h-auto transition-all duration-300"
          />
        </div>

        {images.length > 1 && (
          <div className="flex gap-3 mt-2 overflow-x-auto pb-2">
            {images.map((img) => {
              const isActive = selectedImage === img.url;
              return (
                <button
                  key={img.id}
                  onClick={() => setSelectedImage(img.url)}
                  className={`w-20 h-20 rounded-md overflow-hidden border-2 transition-all duration-200 ${
                    isActive
                      ? "border-[var(--color-primary-500)] shadow-sm"
                      : "border-[var(--color-border)] hover:border-[var(--color-primary-500)]"
                  }`}
                >
                  <Image
                    src={img.url}
                    alt={product.name}
                    width={80}
                    height={80}
                    className="object-cover w-full h-full"
                  />
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="flex-1 space-y-6">
        {/* Badges */}
        <div className="flex items-center gap-2">
          {product.isNew && <Badge variant="success">New</Badge>}
          {product.salePriceNaira && <Badge variant="warning">Sale</Badge>}
        </div>

        {/* Title */}
        <h1 className="heading-2">{product.name}</h1>

        {/* Price */}
        <p className="text-3xl font-semibold text-[var(--color-primary-500)]">
          ₦{price.toLocaleString("en-NG")}
        </p>

        {/* Size Selector */}
        {product.sizes?.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Size</p>
            <div className="flex gap-2 flex-wrap">
              {product.sizes.map((size) => {
                const isActive = selectedSize === size;
                return (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-4 py-2 rounded-md border transition-all duration-200 ${
                      isActive
                        ? "border-[var(--color-primary-500)] bg-[var(--color-primary-500)] text-white shadow-sm"
                        : "border-[var(--color-border)] hover:border-[var(--color-primary-500)]"
                    }`}
                  >
                    {size}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Description */}
        {product.description && (
          <p className="text-[var(--color-text-secondary)] leading-relaxed">
            {product.description}
          </p>
        )}

        {/* Add to Cart */}
        <Button variant="primary" onClick={handleAddToCart} className="w-full">
          Add to Cart
        </Button>
      </div>
    </div>
  );
}
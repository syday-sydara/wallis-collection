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

  const initialImage = product.images?.[0]?.url ?? FALLBACK_IMAGE;
  const [selectedImage, setSelectedImage] = useState(initialImage);

  const price = product.salePriceNaira ?? product.priceNaira;

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      price,
      quantity: 1,
      image: selectedImage || FALLBACK_IMAGE,
    });
  };

  return (
    <div className="w-full max-w-6xl mx-auto py-8 px-4 flex flex-col lg:flex-row gap-10">
      {/* Images */}
      <div className="flex-1 space-y-4">
        <Image
          src={selectedImage}
          alt={product.name}
          width={600}
          height={800}
          className="rounded-lg object-cover w-full h-auto"
          priority
        />

        {product.images.length > 1 && (
          <div className="flex space-x-3 mt-2 overflow-x-auto pb-2">
            {product.images.map((img) => {
              const isActive = img.url === selectedImage;
              return (
                <button
                  key={img.id}
                  onClick={() => setSelectedImage(img.url)}
                  className={`w-20 h-20 rounded-md overflow-hidden border-2 transition-all ${
                    isActive
                      ? "border-[var(--color-primary-500)]"
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

      {/* Info */}
      <div className="flex-1 space-y-5">
        <div className="flex items-center gap-2">
          {product.isNew && <Badge variant="success">New</Badge>}
          {product.isOnSale && <Badge variant="warning">Sale</Badge>}
        </div>

        <h1 className="heading-2">{product.name}</h1>

        <p className="text-2xl font-semibold text-[var(--color-primary-500)]">
          ₦{price.toLocaleString("en-NG")}
        </p>

        {product.description && (
          <p className="text-[var(--color-text-secondary)] leading-relaxed">
            {product.description}
          </p>
        )}

        {product.stock > 0 ? (
          <Button variant="primary" onClick={handleAddToCart}>
            Add to Cart
          </Button>
        ) : (
          <span className="px-4 py-2 bg-red-100 text-red-600 rounded-md font-semibold">
            Out of Stock
          </span>
        )}
      </div>
    </div>
  );
}
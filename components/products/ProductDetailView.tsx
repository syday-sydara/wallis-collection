"use client";

import Image from "next/image";
import { useState } from "react";
import { useCart } from "@/components/cart/CartProvider";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { formatPrice } from "@/lib/formatters";

export default function ProductDetailView({ product }) {
  const { addItem } = useCart();
  
  const images = product.images ?? [];
  const [selectedImage, setSelectedImage] = useState(images[0]?.url || "/placeholder.png");
  const [selectedSize, setSelectedSize] = useState<string | null>(null);

  const price = product.salePriceNaira ?? product.priceNaira ?? 0;
  const isOutOfStock = product.stock <= 0;

  const handleAddToCart = () => {
    // Generate the unique key for this variant
    const variantKey = selectedSize ? `size:${selectedSize}` : "default";
    
    addItem({
      productId: product.id,
      name: product.name,
      price,
      quantity: 1,
      image: selectedImage,
      variants: {
        size: selectedSize ?? "Default",
      },
      key: `${product.id}-${variantKey}`,
      addedAt: new Date(),
    });

    // Optional: Trigger the cart drawer
    window.dispatchEvent(new CustomEvent("open-cart"));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
      {/* Left: Image Gallery */}
      <div className="space-y-4">
        <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-gray-50">
          <Image
            src={selectedImage}
            alt={product.name}
            fill
            className="object-cover transition-transform hover:scale-105 duration-500"
            priority
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
                <Image src={img.url} alt="" fill className="object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Right: Product Info */}
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="heading-1">{product.name}</h1>
          <p className="text-text-secondary mt-1">{product.category} — {product.brand}</p>
        </div>

        <div className="flex items-center gap-3">
          <p className="text-3xl font-semibold text-accent-500">
            {formatPrice(price)}
          </p>
          {product.isOnSale && (
            <p className="text-xl text-text-muted line-through">
              {formatPrice(product.priceNaira)}
            </p>
          )}
        </div>

        {/* Size Selection */}
        {product.sizes?.length > 0 && (
          <div className="space-y-3">
            <span className="text-sm font-medium uppercase tracking-wider">Select Size</span>
            <div className="flex flex-wrap gap-2">
              {product.sizes.map((size: string) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`min-w-[3rem] px-4 py-2 border rounded-md transition-all ${
                    selectedSize === size
                      ? "bg-gray-900 text-white border-gray-900"
                      : "border-gray-200 hover:border-gray-900"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="prose prose-sm text-text-secondary">
          <p>{product.description}</p>
        </div>

        <Button 
          variant="primary" 
          onClick={handleAddToCart} 
          disabled={isOutOfStock}
          className="w-full py-4 text-lg"
        >
          {isOutOfStock ? "Out of Stock" : "Add to Cart"}
        </Button>
      </div>
    </div>
  );
}
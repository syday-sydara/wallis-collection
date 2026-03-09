"use client";

import Image from "next/image";
import { useState } from "react";
import { useCart } from "@/components/cart/cart-context";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";

export default function ProductDetailView({ product }) {
  const { addItem } = useCart();

  const initialImage = product.images[0]?.url ?? "";
  const [selectedImage, setSelectedImage] = useState(initialImage);

  const price = product.salePriceNaira ?? product.priceNaira;

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      price,
      quantity: 1,
      image: selectedImage,
    });
  };

  return (
    <div className="max-w-6xl mx-auto py-10 px-4 flex flex-col lg:flex-row gap-10">
      {/* Images */}
      <div className="flex-1 space-y-4">
        <Image
          src={selectedImage}
          alt={product.name}
          width={600}
          height={800}
          className="rounded-lg object-cover"
        />

        {product.images.length > 1 && (
          <div className="flex space-x-2 mt-2">
            {product.images.map((img) => (
              <div
                key={img.id}
                className={`w-20 h-20 rounded-md overflow-hidden border-2 ${
                  img.url === selectedImage
                    ? "border-[var(--color-primary-500)]"
                    : "border-neutral-300"
                } cursor-pointer`}
                onClick={() => setSelectedImage(img.url)}
              >
                <Image
                  src={img.url}
                  alt={product.name}
                  width={80}
                  height={80}
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 space-y-4">
        <div className="flex items-center space-x-2">
          {product.isNew && <Badge variant="success">New</Badge>}
          {product.isOnSale && <Badge variant="warning">Sale</Badge>}
        </div>

        <h1 className="heading-2">{product.name}</h1>

        <p className="text-xl font-semibold text-[var(--color-primary-500)]">
          ₦{price.toLocaleString()}
        </p>

        {product.description && (
          <p className="text-neutral-600">{product.description}</p>
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

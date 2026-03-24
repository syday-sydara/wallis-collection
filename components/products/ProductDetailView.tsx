"use client";

import Image from "next/image";
import Button from "@/components/ui/Button";
import { ProductDetail, getCurrentPrice, getPrimaryImage } from "@/lib/types/product";

interface Props {
  product: ProductDetail;
  onAddToCart?: () => void;
}

export default function ProductDetailView({ product, onAddToCart }: Props) {
  const price = getCurrentPrice(product);
  const imageUrl = getPrimaryImage(product.images);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
      <div className="relative aspect-[4/5] rounded-xl overflow-hidden bg-gray-50">
        <Image src={imageUrl} alt={product.name} fill className="object-cover" />
      </div>

      <div className="flex flex-col gap-6">
        <h1 className="heading-1">{product.name}</h1>
        <p className="text-text-secondary">{product.category}</p>
        <p className="text-3xl font-semibold text-accent-500">{price.toLocaleString("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 })}</p>
        <Button onClick={onAddToCart} className="w-full py-4 text-lg">Add to Cart</Button>
        <p className="prose prose-sm text-text-secondary">{product.description}</p>
      </div>
    </div>
  );
}
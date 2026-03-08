// app/(public)/products/[slug]/page.tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Skeleton from "@/components/ui/Skeleton";

interface Product {
  id: string;
  name: string;
  slug: string;
  priceCents: number;
  images: string[];
  description: string;
  isNew?: boolean;
  isOnSale?: boolean;
  outOfStock?: boolean;
}

// Mock product data
const PRODUCTS: Product[] = [
  {
    id: "1",
    name: "Ankara Maxi Dress",
    slug: "ankara-maxi-dress",
    priceCents: 35000,
    images: [
      "https://images.unsplash.com/photo-1600180758895-48a89a33cebe?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1598970867893-4cbf9df8d889?auto=format&fit=crop&w=800&q=80"
    ],
    description:
      "Beautiful Ankara maxi dress made with premium African wax print. Perfect for casual and formal events.",
    isNew: true,
    isOnSale: false,
    outOfStock: false,
  },
  {
    id: "2",
    name: "Elegant Abaya",
    slug: "elegant-abaya",
    priceCents: 42000,
    images: [
      "https://images.unsplash.com/photo-1603398938378-57b7300e1e50?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1593032465171-7a7c5e02c03f?auto=format&fit=crop&w=800&q=80"
    ],
    description:
      "Flowing abaya with intricate embroidery. Perfect for stylish modest fashion.",
    isNew: true,
    isOnSale: true,
    outOfStock: false,
  },
  {
    id: "3",
    name: "Super Wax Blouse",
    slug: "super-wax-blouse",
    priceCents: 18000,
    images: [
      "https://images.unsplash.com/photo-1598970868224-6d69f7d96dc7?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1600180758930-1ffbf5b5dfc5?auto=format&fit=crop&w=800&q=80"
    ],
    description:
      "Vibrant super wax print blouse for a colorful statement look.",
    isNew: false,
    isOnSale: true,
    outOfStock: false,
  },
];

export default function ProductDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const [mainImageIndex, setMainImageIndex] = useState(0);

  const product = PRODUCTS.find((p) => p.slug === params.slug);

  if (!product) {
    return <p className="text-center mt-10 text-neutral-600">Product not found.</p>;
  }

  const handleAddToCart = () => {
    console.log("Add to cart:", product.id);
  };

  return (
    <div className="py-10 max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Images */}
      <div className="flex flex-col gap-4">
        <div className="relative w-full h-[500px] rounded-lg overflow-hidden">
          <Image
            src={product.images[mainImageIndex]}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-300"
          />
        </div>

        {/* Thumbnails */}
        <div className="flex gap-2">
          {product.images.map((img, idx) => (
            <div
              key={idx}
              className={`w-20 h-20 rounded-lg overflow-hidden border-2 cursor-pointer ${
                mainImageIndex === idx ? "border-primary" : "border-border"
              }`}
              onClick={() => setMainImageIndex(idx)}
            >
              <Image src={img} alt={`${product.name} ${idx}`} fill className="object-cover" />
            </div>
          ))}
        </div>
      </div>

      {/* Details */}
      <div className="flex flex-col gap-4">
        <h1 className="heading-1">{product.name}</h1>

        <div className="flex items-center gap-2">
          {product.isNew && <Badge variant="success">New</Badge>}
          {product.isOnSale && <Badge variant="warning">Sale</Badge>}
          {product.outOfStock && <Badge variant="danger">Out of stock</Badge>}
        </div>

        <p className="text-2xl font-semibold mt-2">₦{product.priceCents.toLocaleString("en-NG")}</p>

        <p className="mt-4 text-neutral-600">{product.description}</p>

        {!product.outOfStock && (
          <Button variant="primary" className="mt-6 w-full" onClick={handleAddToCart}>
            Add to Cart
          </Button>
        )}
      </div>
    </div>
  );
}
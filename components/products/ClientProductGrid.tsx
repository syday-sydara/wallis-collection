// File: components/products/ClientProductGrid.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { ProductCard } from "@/lib/types/product";

interface ClientProductGridProps {
  products: (ProductCard & { formattedPrice?: string })[];
}

export default function ClientProductGrid({ products }: ClientProductGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
      {products.map((product) => (
        <Link key={product.id} href={`/products/${product.slug}`}>
          <div className="group relative rounded-lg overflow-hidden border hover:shadow-lg transition">
            <div className="aspect-[3/4] relative">
              <Image
                src={product.images[0]?.url ?? "/fallback-product.jpg"}
                alt={product.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform"
              />
            </div>
            <div className="p-3">
              <h3 className="text-sm font-medium">{product.name}</h3>
              <p className="mt-1 text-sm text-[var(--color-accent-500)] font-semibold">
                {product.formattedPrice ?? `₦${(product.salePrice ?? product.price / 100).toLocaleString()}`}
              </p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
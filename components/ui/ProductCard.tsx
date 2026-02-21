// File: components/ui/ProductCard.tsx
"use client";
import Link from "next/link";
import Image from "next/image"; // Optimization fix
import { useState } from "react";

// ... types remain the same

export default function ProductCard({ product }: { product: Product }) {
  const [loading, setLoading] = useState(false);
  const price = new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(product.priceCents / 100);
  const image = Array.isArray(product.images) && product.images.length > 0 ? product.images[0] : null;

  // Use your new status color variables from the CSS theme
  const stockStatus = product.stock === 0
    ? { label: "Out of stock", color: "bg-status-danger/10 text-status-danger" }
    : product.stock < 5
    ? { label: "Low stock", color: "bg-status-warning/10 text-status-warning" }
    : { label: "In stock", color: "bg-status-success/10 text-status-success" };

  return (
    <div className="group relative bg-bg border border-neutral/20 rounded-xl overflow-hidden shadow-soft hover:shadow-card transition-all duration-400">
      <Link href={`/products/${product.slug}`} className="block relative h-64 bg-neutral/10 overflow-hidden">
        {image ? (
          <Image src={image} alt={product.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="flex items-center justify-center h-full text-neutral text-sm">No Image</div>
        )}
      </Link>

      <div className="p-4 space-y-3">
        <h3 className="text-sm font-medium text-primary line-clamp-1">{product.name}</h3>
        <p className="text-lg font-semibold text-secondary">{price}</p>
        
        <span className={`inline-block text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-md ${stockStatus.color}`}>
          {stockStatus.label}
        </span>

        <button
          disabled={product.stock === 0 || loading}
          onClick={() => { setLoading(true); setTimeout(() => setLoading(false), 800); }}
          className="w-full bg-primary text-bg text-sm py-2.5 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {loading ? "Adding..." : "Add to Cart"}
        </button>
      </div>
    </div>
  );
}
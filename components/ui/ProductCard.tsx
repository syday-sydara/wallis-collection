// File: components/ui/ProductCard.tsx
import Link from "next/link";

type Product = {
  id: string;
  name: string;
  slug: string;
  priceCents: number;
  images: string[]; // array of image URLs
};

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const price = (product.priceCents / 100).toFixed(2);

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group relative block overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-lg transition-shadow duration-400 ease-smooth"
    >
      <div className="h-48 bg-gray-100 flex items-center justify-center overflow-hidden">
        {product.images?.[0] ? (
          <img
            src={product.images[0]}
            alt={product.name}
            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-400 ease-smooth"
          />
        ) : (
          <span className="text-gray-400 text-sm">No Image</span>
        )}
      </div>
      <div className="p-4 space-y-1">
        <h3 className="text-sm font-medium text-gray-900 group-hover:text-primary transition-colors duration-400 ease-smooth">
          {product.name}
        </h3>
        <p className="text-sm font-semibold text-gray-700">${price}</p>
      </div>
    </Link>
  );
}
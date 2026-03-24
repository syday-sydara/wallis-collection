import Image from "next/image";
import Link from "next/link";
import AddToCartButton from "@/components/cart/AddToCartButton";

export interface ProductCardProps {
  id: string;
  name: string;
  slug: string;
  priceNaira: number;
  salePriceNaira?: number;
  images?: { url: string }[];
  isNew?: boolean;
  isOnSale?: boolean;
  stock?: number;
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(value);

export default function ProductCard({
  id,
  name,
  slug,
  priceNaira,
  salePriceNaira,
  images = [],
  isNew = false,
  isOnSale = false,
  stock = 0,
}: ProductCardProps) {
  const outOfStock = stock <= 0;
  const discounted = isOnSale && salePriceNaira != null;
  const currentPrice = discounted ? salePriceNaira! : priceNaira;
  const imageUrl = images[0]?.url ?? "/fallback-product.jpg";

  const stockMessage = outOfStock
    ? "Out of stock"
    : stock <= 10
    ? `Only ${stock} left`
    : "In stock";

  return (
    <article className="card group relative flex flex-col" data-product-id={id}>
      {/* Badges */}
      <div className="absolute top-2 left-2 z-10 flex gap-2">
        {isNew && (
          <span className="label bg-success-500 text-white px-2 py-1 rounded-sm">
            New
          </span>
        )}
        {discounted && (
          <span className="label bg-accent-500 text-white px-2 py-1 rounded-sm">
            Sale
          </span>
        )}
      </div>

      {/* Out of stock overlay */}
      {outOfStock && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/40 text-white font-semibold pointer-events-none">
          Out of stock
        </div>
      )}

      {/* Image */}
      <Link href={`/products/${slug}`} prefetch={false} className="block w-full overflow-hidden rounded-xl">
        <div className="relative aspect-[3/4]">
          <Image
            src={imageUrl}
            alt={name}
            fill
            className="object-cover transition-transform duration-300 ease-out group-hover:scale-105"
          />
        </div>
      </Link>

      {/* Content */}
      <div className="card-body flex flex-col flex-1">
        <header>
          <Link href={`/products/${slug}`}>
            <h3 className="heading-3 truncate hover:underline">{name}</h3>
          </Link>
        </header>

        {/* Price */}
        <section className="mt-2 flex items-baseline gap-2">
          <p className="text-body font-semibold text-accent-500">{formatCurrency(currentPrice)}</p>
          {discounted && (
            <p className="text-body line-through text-text-muted">{formatCurrency(priceNaira)}</p>
          )}
        </section>

        {/* Stock */}
        <p className="text-small mt-1 text-text-muted">{stockMessage}</p>

        {/* Add to Cart */}
        <footer className="mt-auto">
          <AddToCartButton
            product={{
              id,
              name,
              price: priceNaira,
              salePrice: salePriceNaira ?? null,
              stock,
              images: images[0] ? [{ url: images[0].url, position: 0 }] : [],
            }}
          />
        </footer>
      </div>
    </article>
  );
}
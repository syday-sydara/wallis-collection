import type { ProductCardVM } from "@/lib/catalog/types";

type ProductCardProps = {
  product: ProductCardVM;
};

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <div
      className="
        flex flex-col rounded-lg border border-border bg-surface
        shadow-sm overflow-hidden transition-all duration-150
        hover:shadow-md hover:bg-surface-hover
        active:shadow-lg active:bg-surface-active
      "
    >
      {/* =========================
           PRODUCT IMAGE
      ========================= */}
      <div className="relative aspect-square w-full overflow-hidden bg-surface-muted">
        {product.images?.[0] ? (
          <img
            src={product.images[0].url}
            alt={product.images[0].alt || product.name}
            className="h-full w-full object-cover transition-transform duration-150 ease-in-out hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-surface-muted text-text-muted">
            No image
          </div>
        )}
      </div>

      {/* =========================
           PRODUCT INFO
      ========================= */}
      <div className="flex flex-1 flex-col p-3">
        <h3 className="text-sm font-medium text-text line-clamp-2">
          {product.name}
        </h3>

        <p className="mt-1 text-sm font-semibold text-text">
          ₦{(product.minPrice / 100).toLocaleString()}
          {product.minPrice !== product.maxPrice &&
            ` - ₦${(product.maxPrice / 100).toLocaleString()}`}
        </p>

        {product.inStock ? (
          <span className="mt-1 text-xs font-medium text-success">
            In stock
          </span>
        ) : (
          <span className="mt-1 text-xs font-medium text-danger">
            Out of stock
          </span>
        )}
      </div>
    </div>
  );
}
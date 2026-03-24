// lib/cart.ts
import type { CartItem, ProductCardData } from "@/lib/types/types";

/* ---------------------------------- */
/* Create a CartItem from Product     */
/* ---------------------------------- */
export function toCartItem(
  product: ProductCardData,
  quantity: number = 1,
  selectedVariants: Record<string, string> = {}
): CartItem {
  // Use the sale price if available, otherwise fallback to regular price
  const activePrice = product.salePriceNaira ?? product.priceNaira;
  
  const key = generateCartKey(product.id, selectedVariants);
  
  return {
    productId: product.id,
    name: product.name,
    price: activePrice, 
    image: product.images?.[0]?.url ?? "",
    quantity,
    addedAt: new Date(),
    key, 
    variants: selectedVariants,
  };
}

/* ---------------------------------- */
/* Generate unique key per product+variant */
/* ---------------------------------- */
export function generateCartKey(
  productId: string,
  variants: Record<string, string>
) {
  const variantString =
    Object.entries(variants)
      .sort(([a], [b]) => a.localeCompare(b)) // Sort keys to ensure {size:M, color:Red} === {color:Red, size:M}
      .map(([k, v]) => `${k}:${v}`)
      .join("|") || "default";
      
  return `${productId}-${variantString}`;
}

/* ---------------------------------- */
/* Calculate totals (Source of Truth) */
/* ---------------------------------- */
export function calculateCartTotal(cart: CartItem[]): number {
  return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

export function countCartItems(cart: CartItem[]): number {
  return cart.reduce((sum, item) => sum + item.quantity, 0);
}

/* ---------------------------------- */
/* Persistence Helpers                */
/* ---------------------------------- */
export function saveCartSnapshot(cart: CartItem[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("cart_snapshot", JSON.stringify(cart));
  } catch (e) {
    console.error("Failed to save cart snapshot", e);
  }
}
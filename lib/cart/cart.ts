import type { CartItem } from "@/lib/types/types";
import { v4 as uuidv4 } from "uuid";

/**
 * Generate unique cart key (product + variants)
 */
export function generateCartKey(productId: string, variants: Record<string, string>) {
  const variantString = Object.entries(variants)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k.toLowerCase()}:${v.toLowerCase()}`)
    .join("|") || "default";
  return `${productId}-${variantString}`;
}

/**
 * Convert product to CartItem
 */
export function toCartItem(
  product: any,
  quantity: number = 1,
  selectedVariants: Record<string, string> = {}
): CartItem {
  const basePrice = product.priceNaira;
  const salePrice = product.salePriceNaira ?? null;
  const activePrice = salePrice ?? basePrice;
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

/**
 * Calculate total price
 */
export function calculateCartTotal(cart: CartItem[]): number {
  return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

/**
 * Count total items
 */
export function countCartItems(cart: CartItem[]): number {
  return cart.reduce((sum, item) => sum + item.quantity, 0);
}